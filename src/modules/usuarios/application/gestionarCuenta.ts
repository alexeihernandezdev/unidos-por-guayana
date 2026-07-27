import type { PasswordHasher } from "@/modules/usuarios/domain/PasswordHasher";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import type { UsuarioRepository } from "@/modules/usuarios/domain/UsuarioRepository";
import {
  DatosCuentaInvalidosError,
  EmailYaRegistradoError,
  PasswordActualIncorrectaError,
  UsuarioNoEncontradoError,
} from "./errors";

// Casos de uso de la cuenta base (nombre, correo y contraseña), editable por
// cualquier rol desde su perfil (feature 035). Puros: solo dependen del dominio
// (repositorio y hasher como contratos). Normalizan y validan antes de persistir.
// La misma validación de formato del email/contraseña que aplica el registro
// (`crearAuditor`) se replica aquí para que el borde de servidor sea la verdad.

type ActualizarDatosDeps = { usuarios: UsuarioRepository };
type CambiarPasswordDeps = { usuarios: UsuarioRepository; hasher: PasswordHasher };

export type ActualizarDatosCuentaInput = { nombre: string; email: string };
export type CambiarPasswordInput = {
  passwordActual: string;
  passwordNueva: string;
};

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * Actualiza el nombre y el correo de una cuenta. Normaliza (trim + lowercase del
 * correo), valida el formato y evita colisionar con el correo de otra cuenta.
 */
export async function actualizarDatosCuenta(
  { usuarios }: ActualizarDatosDeps,
  usuarioId: string,
  input: ActualizarDatosCuentaInput,
): Promise<Usuario> {
  const actual = await usuarios.buscarPorId(usuarioId);
  if (!actual) throw new UsuarioNoEncontradoError(usuarioId);

  const nombre = input.nombre.trim();
  const email = input.email.trim().toLowerCase();

  if (nombre.length < 2 || nombre.length > 80) {
    throw new DatosCuentaInvalidosError("Indica un nombre válido.");
  }
  if (!EMAIL_RE.test(email)) {
    throw new DatosCuentaInvalidosError("Introduce un correo válido.");
  }

  // Solo comprobamos unicidad si el correo cambia; si otra cuenta ya lo usa, se
  // rechaza (el correo es el identificador de inicio de sesión).
  if (email !== actual.email) {
    const existente = await usuarios.buscarPorEmail(email);
    if (existente && existente.id !== usuarioId) {
      throw new EmailYaRegistradoError(email);
    }
  }

  return usuarios.actualizarCuenta(usuarioId, { nombre, email });
}

/**
 * Cambia la contraseña de una cuenta previa verificación de la contraseña actual
 * (autorización), y validando la longitud de la nueva. Guarda siempre el hash.
 */
export async function cambiarPassword(
  { usuarios, hasher }: CambiarPasswordDeps,
  usuarioId: string,
  input: CambiarPasswordInput,
): Promise<Usuario> {
  const actual = await usuarios.buscarPorId(usuarioId);
  if (!actual) throw new UsuarioNoEncontradoError(usuarioId);

  const coincide = await hasher.verificar(
    input.passwordActual,
    actual.passwordHash,
  );
  if (!coincide) throw new PasswordActualIncorrectaError();

  if (input.passwordNueva.length < 8 || input.passwordNueva.length > 100) {
    throw new DatosCuentaInvalidosError(
      "La contraseña debe tener entre 8 y 100 caracteres.",
    );
  }

  const passwordHash = await hasher.hash(input.passwordNueva);
  return usuarios.actualizarPassword(usuarioId, passwordHash);
}
