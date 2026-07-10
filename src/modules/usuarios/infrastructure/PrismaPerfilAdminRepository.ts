import { prisma } from "@/lib/prisma";
import type {
  CambiosPerfilAdmin,
  NuevoPerfilAdmin,
  PerfilAdmin,
} from "@/modules/usuarios/domain/PerfilAdmin";
import type { PerfilAdminRepository } from "@/modules/usuarios/domain/PerfilAdminRepository";

// Implementación del repositorio de perfiles sobre Prisma (feature 016). Los
// enums de dominio y de Prisma comparten valores, así que la fila es asignable a
// la entidad de dominio sin conversiones.
export class PrismaPerfilAdminRepository implements PerfilAdminRepository {
  async crear(datos: NuevoPerfilAdmin): Promise<PerfilAdmin> {
    return prisma.perfilAdmin.create({ data: datos });
  }

  async buscarPorUsuarioId(usuarioId: string): Promise<PerfilAdmin | null> {
    return prisma.perfilAdmin.findUnique({ where: { usuarioId } });
  }

  async actualizar(
    usuarioId: string,
    cambios: CambiosPerfilAdmin,
  ): Promise<PerfilAdmin> {
    return prisma.perfilAdmin.update({ where: { usuarioId }, data: cambios });
  }
}
