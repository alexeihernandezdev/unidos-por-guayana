import { redirect } from "next/navigation";
import { auth, buscarUsuarioPorId } from "@/lib/auth";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { puedeOperarComoAdmin } from "@/modules/usuarios/domain/verificacion";

// Helpers de sesión para el servidor (server components, server actions y route
// handlers). `src/shared` es transversal, así que la presentación puede leer la
// sesión a través de aquí sin importar `src/lib` directamente.

export type UsuarioSesion = {
  id: string;
  rol: Rol;
  nombre: string | null;
  email: string | null;
};

/** Devuelve el usuario de la sesión actual, o `null` si no hay sesión. */
export async function getUsuarioActual(): Promise<UsuarioSesion | null> {
  const session = await auth();
  if (!session?.user) return null;
  return {
    id: session.user.id,
    rol: session.user.rol,
    nombre: session.user.name ?? null,
    email: session.user.email ?? null,
  };
}

/** Exige sesión; si no hay, redirige a /login. */
export async function requireSesion(): Promise<UsuarioSesion> {
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/login");
  return usuario;
}

/**
 * Exige que el usuario tenga uno de los roles indicados. Sin sesión → /login;
 * con sesión pero rol no autorizado → inicio (/). Es el gate por rol para el
 * servidor.
 */
export async function requireRol(...roles: Rol[]): Promise<UsuarioSesion> {
  const usuario = await requireSesion();
  if (!roles.includes(usuario.rol)) redirect("/");
  return usuario;
}

/**
 * Exige un `ADMIN` que además pueda operar: rol `ADMIN` y `estadoVerificacion`
 * VERIFICADO leído **fresco de base** (no del JWT, que puede estar obsoleto tras
 * una aprobación). Es el gate de las rutas y acciones de administración desde la
 * feature 015. Sin sesión → /login; con rol distinto de `ADMIN` → inicio (/);
 * `ADMIN` no verificado (PENDIENTE/RECHAZADO) → /cuenta-admin, donde ve el estado
 * de su solicitud. Doble candado con la comprobación en los casos de uso.
 */
export async function requireAdminVerificado(): Promise<UsuarioSesion> {
  const usuario = await requireSesion();
  if (usuario.rol !== Rol.ADMIN) redirect("/");

  const fresco = await buscarUsuarioPorId(usuario.id);
  if (!fresco || !puedeOperarComoAdmin(fresco)) redirect("/cuenta-admin");

  return usuario;
}
