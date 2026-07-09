import type { PasswordHasher } from "@/modules/usuarios/domain/PasswordHasher";
import type { NuevoUsuario, Usuario } from "@/modules/usuarios/domain/Usuario";
import type { UsuarioRepository } from "@/modules/usuarios/domain/UsuarioRepository";
import { EstadoVerificacion } from "@/modules/usuarios/domain/Rol";

// Dobles en memoria para los tests de casos de uso. No tocan la base ni bcrypt.

export class InMemoryUsuarioRepository implements UsuarioRepository {
  private readonly porEmail = new Map<string, Usuario>();
  private secuencia = 0;

  async crear(datos: NuevoUsuario): Promise<Usuario> {
    const ahora = new Date();
    const usuario: Usuario = {
      id: `usuario-${++this.secuencia}`,
      estadoVerificacion: EstadoVerificacion.PENDIENTE,
      createdAt: ahora,
      updatedAt: ahora,
      ...datos,
    };
    this.porEmail.set(usuario.email, usuario);
    return usuario;
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.porEmail.get(email) ?? null;
  }
}

// Hasher falso, determinista y sin coste: marca el hash con un prefijo para poder
// comprobar en los tests que la contraseña se hasheó (no se guardó en claro).
export const PREFIJO_HASH = "hashed:";

export class FakePasswordHasher implements PasswordHasher {
  async hash(passwordPlano: string): Promise<string> {
    return `${PREFIJO_HASH}${passwordPlano}`;
  }

  async verificar(passwordPlano: string, hash: string): Promise<boolean> {
    return hash === `${PREFIJO_HASH}${passwordPlano}`;
  }
}
