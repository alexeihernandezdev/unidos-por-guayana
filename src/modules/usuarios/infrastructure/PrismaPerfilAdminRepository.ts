import { prisma } from "@/lib/prisma";
import type {
  CambiosPerfilAdmin,
  NuevoPerfilAdmin,
  PerfilAdmin,
} from "@/modules/usuarios/domain/PerfilAdmin";
import type { PerfilAdminRepository } from "@/modules/usuarios/domain/PerfilAdminRepository";

// Fila tal cual la devuelve Prisma: `estadoId`/`municipioId` son nullable en base
// (feature 020, para no bloquear la migración de perfiles previos). El flujo los
// exige, así que en el dominio se tratan como `string`; al leer se coercen los
// nulos residuales a "" (una cuenta así queda a re-seleccionar su ubicación).
type FilaPerfilAdmin = Omit<PerfilAdmin, "estadoId" | "municipioId"> & {
  estadoId: string | null;
  municipioId: string | null;
};

function aDominio(fila: FilaPerfilAdmin): PerfilAdmin {
  return {
    ...fila,
    estadoId: fila.estadoId ?? "",
    municipioId: fila.municipioId ?? "",
  };
}

// Implementación del repositorio de perfiles sobre Prisma (feature 016; ubicación
// por catálogo desde 020). Los enums de dominio y de Prisma comparten valores.
export class PrismaPerfilAdminRepository implements PerfilAdminRepository {
  async crear(datos: NuevoPerfilAdmin): Promise<PerfilAdmin> {
    const fila = await prisma.perfilAdmin.create({ data: datos });
    return aDominio(fila);
  }

  async buscarPorUsuarioId(usuarioId: string): Promise<PerfilAdmin | null> {
    const fila = await prisma.perfilAdmin.findUnique({ where: { usuarioId } });
    return fila ? aDominio(fila) : null;
  }

  async actualizar(
    usuarioId: string,
    cambios: CambiosPerfilAdmin,
  ): Promise<PerfilAdmin> {
    const fila = await prisma.perfilAdmin.update({
      where: { usuarioId },
      data: cambios,
    });
    return aDominio(fila);
  }
}
