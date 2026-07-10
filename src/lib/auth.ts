import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {
  actualizarDatosContacto as actualizarDatosContactoCaso,
  type ActualizarDatosContactoInput,
} from "@/modules/usuarios/application/actualizarDatosContacto";
import {
  aprobarAdmin,
  listarAdminsPendientes,
  rechazarAdmin,
  type Actor,
} from "@/modules/usuarios/application/gestionarAdmins";
import {
  actualizarPerfilAdmin,
  crearPerfilAdmin,
  obtenerPerfilAdmin,
} from "@/modules/usuarios/application/gestionarPerfilAdmin";
import {
  registrarUsuario,
  type RegistrarUsuarioInput,
} from "@/modules/usuarios/application/registrarUsuario";
import { validarCredenciales } from "@/modules/usuarios/application/validarCredenciales";
import type {
  CambiosPerfilAdmin,
  DatosPerfilAdmin,
  PerfilAdmin,
} from "@/modules/usuarios/domain/PerfilAdmin";
import { Rol } from "@/modules/usuarios/domain/Rol";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import { BcryptPasswordHasher } from "@/modules/usuarios/infrastructure/BcryptPasswordHasher";
import { PrismaPerfilAdminRepository } from "@/modules/usuarios/infrastructure/PrismaPerfilAdminRepository";
import { PrismaUsuarioRepository } from "@/modules/usuarios/infrastructure/PrismaUsuarioRepository";
import { PrismaUbicacionRepository } from "@/modules/ubicaciones/infrastructure/PrismaUbicacionRepository";

// ── Composition root ────────────────────────────────────────────────────────
// `src/lib` es infraestructura global (tech-stack.md): aquí se cablean las
// implementaciones concretas con los casos de uso puros. Se instancian una sola
// vez y se reutilizan.
const usuarios = new PrismaUsuarioRepository();
const perfiles = new PrismaPerfilAdminRepository();
const hasher = new BcryptPasswordHasher();
const ubicaciones = new PrismaUbicacionRepository();

/**
 * Registro con la infraestructura ya inyectada. Lo consume el server action de
 * registro a través de la fachada `@/shared/auth` (la presentación no importa
 * infraestructura directamente; ese límite lo hace cumplir ESLint).
 */
export function registrarNuevoUsuario(
  input: RegistrarUsuarioInput,
): Promise<Usuario> {
  return registrarUsuario({ usuarios, hasher, ubicaciones }, input);
}

// ── Perfil de administrador / centro de acopio (feature 016) ──────────────────

/**
 * Registro público de un administrador con su perfil de centro de acopio: crea
 * la cuenta `ADMIN` (nace en `PENDIENTE`, feature 015) y su `PerfilAdmin` en el
 * mismo acto. Los datos se validan antes en el límite y en los casos de uso; si
 * la creación del perfil fallara, la cuenta quedaría sin perfil (se registra el
 * fallo). El caso de uso de registro sigue rechazando roles no auto-registrables.
 */
export async function registrarAdministradorConPerfil(
  cuenta: Omit<RegistrarUsuarioInput, "rol">,
  perfil: DatosPerfilAdmin,
): Promise<Usuario> {
  const usuario = await registrarUsuario(
    { usuarios, hasher, ubicaciones },
    { ...cuenta, rol: Rol.ADMIN },
  );
  await crearPerfilAdmin(
    { perfiles, ubicaciones },
    { usuarioId: usuario.id, ...perfil },
  );
  return usuario;
}

export function obtenerPerfilAdminGestion(
  usuarioId: string,
): Promise<PerfilAdmin | null> {
  return obtenerPerfilAdmin({ perfiles }, usuarioId);
}

export function actualizarPerfilAdminGestion(
  usuarioId: string,
  cambios: CambiosPerfilAdmin,
): Promise<PerfilAdmin> {
  return actualizarPerfilAdmin({ perfiles, ubicaciones }, usuarioId, cambios);
}

// ── Gestión de administradores por el SUPERADMIN (feature 015) ────────────────
// Casos de uso puros con la infraestructura ya inyectada. Los consume la bandeja
// del superadmin a través de la fachada `@/shared/auth`.
export function listarAdminsPendientesGestion(actor: Actor): Promise<Usuario[]> {
  return listarAdminsPendientes({ usuarios }, actor);
}

export function aprobarAdminGestion(
  actor: Actor,
  adminId: string,
): Promise<Usuario> {
  return aprobarAdmin({ usuarios }, actor, adminId);
}

export function rechazarAdminGestion(
  actor: Actor,
  adminId: string,
): Promise<Usuario> {
  return rechazarAdmin({ usuarios }, actor, adminId);
}

/**
 * Lee el usuario fresco de base por id. Lo usa el guard de servidor
 * `requireAdminVerificado` para comprobar el `estadoVerificacion` real (una
 * aprobación surte efecto sin re-login, sin fiarse del valor cacheado en el JWT).
 */
export function buscarUsuarioPorId(id: string): Promise<Usuario | null> {
  return usuarios.buscarPorId(id);
}

/**
 * Guarda los datos de contacto/ubicación de un COLABORADOR/SOLICITANTE. Lo
 * consumen `/completar-perfil` (primer login) y `/mi-perfil` (edición) a
 * través de la fachada `@/shared/auth` (feature 017).
 */
export function actualizarDatosContactoUsuario(
  usuarioId: string,
  input: ActualizarDatosContactoInput,
): Promise<Usuario> {
  return actualizarDatosContactoCaso({ usuarios, ubicaciones }, usuarioId, input);
}

// ── Auth.js v5 (NextAuth) ─────────────────────────────────────────────────────
// Provider de credenciales (email + contraseña) con sesión JWT. El provider de
// credenciales exige JWT y no persiste sesión vía adapter, por eso no se usa el
// adapter de Prisma: la tabla `Usuario` es nuestra y la gestiona el caso de uso
// de registro. El rol viaja embebido en el token (callbacks jwt/session).
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const email =
          typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const usuario = await validarCredenciales(
          { usuarios, hasher },
          email,
          password,
        );
        if (!usuario) return null;

        // Lo devuelto se serializa en el JWT (ver callbacks). No incluir el hash.
        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          rol: usuario.rol,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.rol = user.rol;
      }
      return token;
    },
    session: async ({ session, token }) => {
      // El JWT no está tipado con `id`/`rol` (ver nota en next-auth.d.ts): se
      // leen con guards de tipo, robustos ante cualquier gestor de paquetes.
      if (typeof token.id === "string") session.user.id = token.id;
      if (typeof token.rol === "string") session.user.rol = token.rol as Rol;
      return session;
    },
  },
});
