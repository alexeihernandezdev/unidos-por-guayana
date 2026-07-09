import type { PasswordHasher } from "@/modules/usuarios/domain/PasswordHasher";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import type { UsuarioRepository } from "@/modules/usuarios/domain/UsuarioRepository";

export type ValidarCredencialesDeps = {
  usuarios: UsuarioRepository;
  hasher: PasswordHasher;
};

/**
 * Valida un par email + contraseña. Lo usa el `authorize` del provider de
 * credenciales de Auth.js. Devuelve el usuario si las credenciales son
 * correctas, o `null` en cualquier otro caso (email inexistente o contraseña
 * incorrecta) — sin distinguir cuál falló, para no filtrar información.
 */
export async function validarCredenciales(
  { usuarios, hasher }: ValidarCredencialesDeps,
  email: string,
  password: string,
): Promise<Usuario | null> {
  const usuario = await usuarios.buscarPorEmail(email.trim().toLowerCase());
  if (!usuario) {
    return null;
  }

  const coincide = await hasher.verificar(password, usuario.passwordHash);
  return coincide ? usuario : null;
}
