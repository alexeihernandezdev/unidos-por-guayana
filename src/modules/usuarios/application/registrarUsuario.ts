import type { PasswordHasher } from "@/modules/usuarios/domain/PasswordHasher";
import {
  validarDatosContacto,
  type DatosContacto,
} from "@/modules/usuarios/domain/datosContacto";
import {
  esRolAutoRegistrable,
  Rol,
  type Rol as RolType,
} from "@/modules/usuarios/domain/Rol";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import type { UsuarioRepository } from "@/modules/usuarios/domain/UsuarioRepository";
import {
  CedulaYaRegistradaError,
  DatosContactoInvalidosError,
  EmailYaRegistradoError,
  RolNoAutoRegistrableError,
} from "./errors";

export type RegistrarUsuarioDeps = {
  usuarios: UsuarioRepository;
  hasher: PasswordHasher;
};

// Entrada del caso de uso. Los datos de contacto son opcionales aquí: se
// exigen dinámicamente para `COLABORADOR` y `SOLICITANTE` (feature 017) y para
// el `ADMIN` solo se acepta el flag `telefonoEsWhatsApp` (que también se
// guarda en su `PerfilAdmin`).
export type RegistrarUsuarioInput = {
  nombre: string;
  email: string;
  password: string;
  rol: RolType;
  datosContacto?: DatosContacto;
};

/**
 * Da de alta un usuario:
 * 1. Rechaza roles no auto-registrables (el `SUPERADMIN`) — regla de dominio.
 * 2. Verifica que el email no exista ya.
 * 3. Si el rol es COLABORADOR/SOLICITANTE, valida y normaliza los datos de
 *    contacto/ubicación y rechaza cédula duplicada (feature 017).
 * 4. Hashea la contraseña y crea el usuario con todos sus datos.
 *
 * Desde la feature 015 el `ADMIN` es de registro público: se crea como cualquier
 * otro rol y nace en `estadoVerificacion = PENDIENTE` (valor por defecto del
 * repositorio); no opera hasta que un `SUPERADMIN` lo aprueba.
 *
 * Caso de uso puro: solo depende del dominio (repositorio y hasher como
 * contratos). La validación del formato de entrada ocurre en el límite
 * (presentación); aquí se aplican las reglas de negocio.
 */
export async function registrarUsuario(
  { usuarios, hasher }: RegistrarUsuarioDeps,
  input: RegistrarUsuarioInput,
): Promise<Usuario> {
  if (!esRolAutoRegistrable(input.rol)) {
    throw new RolNoAutoRegistrableError(input.rol);
  }

  const email = input.email.trim().toLowerCase();

  const existentePorEmail = await usuarios.buscarPorEmail(email);
  if (existentePorEmail) {
    throw new EmailYaRegistradoError(email);
  }

  const passwordHash = await hasher.hash(input.password);

  // Rol COLABORADOR/SOLICITANTE: exige los cinco campos de contacto.
  if (input.rol === Rol.COLABORADOR || input.rol === Rol.SOLICITANTE) {
    if (!input.datosContacto) {
      throw new DatosContactoInvalidosError("La cédula es obligatoria.");
    }
    const validacion = validarDatosContacto(input.datosContacto);
    if (!validacion.ok) {
      throw new DatosContactoInvalidosError(validacion.error);
    }
    const cedulaExistente = await usuarios.buscarPorCedula(validacion.valor.cedula);
    if (cedulaExistente) {
      throw new CedulaYaRegistradaError();
    }
    return usuarios.crear({
      email,
      nombre: input.nombre.trim(),
      passwordHash,
      rol: input.rol,
      cedula: validacion.valor.cedula,
      telefono: validacion.valor.telefono,
      telefonoEsWhatsApp: validacion.valor.telefonoEsWhatsApp,
      estado: validacion.valor.estado,
      parroquia: validacion.valor.parroquia,
    });
  }

  // Rol ADMIN: no exige datos de contacto en `Usuario` (viven en `PerfilAdmin`,
  // feature 016). Solo respeta el flag WhatsApp si viene, para reflejar el
  // canal preferente del centro de acopio también en su cuenta base.
  return usuarios.crear({
    email,
    nombre: input.nombre.trim(),
    passwordHash,
    rol: input.rol,
    telefonoEsWhatsApp: input.datosContacto?.telefonoEsWhatsApp ?? false,
  });
}
