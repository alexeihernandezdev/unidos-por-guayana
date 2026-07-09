import type { PasswordHasher } from "@/modules/usuarios/domain/PasswordHasher";
import { esRolAutoRegistrable, type Rol } from "@/modules/usuarios/domain/Rol";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import type { UsuarioRepository } from "@/modules/usuarios/domain/UsuarioRepository";
import { EmailYaRegistradoError, RolNoAutoRegistrableError } from "./errors";

export type RegistrarUsuarioDeps = {
  usuarios: UsuarioRepository;
  hasher: PasswordHasher;
};

export type RegistrarUsuarioInput = {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
};

/**
 * Da de alta un usuario:
 * 1. Rechaza roles no auto-registrables (p. ej. `ADMIN`) — regla de dominio.
 * 2. Verifica que el email no exista ya.
 * 3. Hashea la contraseña y crea el usuario.
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

  const existente = await usuarios.buscarPorEmail(email);
  if (existente) {
    throw new EmailYaRegistradoError(email);
  }

  const passwordHash = await hasher.hash(input.password);

  return usuarios.crear({
    email,
    nombre: input.nombre.trim(),
    passwordHash,
    rol: input.rol,
  });
}
