import { prisma } from "@/lib/prisma";
import type { NuevoUsuario, Usuario } from "@/modules/usuarios/domain/Usuario";
import type { UsuarioRepository } from "@/modules/usuarios/domain/UsuarioRepository";

// Implementación del repositorio sobre Prisma. Los enums de dominio y los de
// Prisma comparten los mismos valores (misma unión de strings), así que la fila
// es asignable a la entidad de dominio sin conversiones.
export class PrismaUsuarioRepository implements UsuarioRepository {
  async crear(datos: NuevoUsuario): Promise<Usuario> {
    return prisma.usuario.create({ data: datos });
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({ where: { email } });
  }
}
