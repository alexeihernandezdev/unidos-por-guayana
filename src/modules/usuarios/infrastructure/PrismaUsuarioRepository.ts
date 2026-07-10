import { prisma } from "@/lib/prisma";
import type { EstadoVerificacion } from "@/modules/usuarios/domain/Rol";
import { EstadoVerificacion as EstadoVerificacionEnum, Rol } from "@/modules/usuarios/domain/Rol";
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

  async buscarPorId(id: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({ where: { id } });
  }

  async listarAdminsPendientes(): Promise<Usuario[]> {
    return prisma.usuario.findMany({
      where: {
        rol: Rol.ADMIN,
        estadoVerificacion: EstadoVerificacionEnum.PENDIENTE,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async actualizarEstadoVerificacion(
    id: string,
    estado: EstadoVerificacion,
  ): Promise<Usuario> {
    return prisma.usuario.update({
      where: { id },
      data: { estadoVerificacion: estado },
    });
  }
}
