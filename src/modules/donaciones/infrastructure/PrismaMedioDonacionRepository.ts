import { prisma } from "@/lib/prisma";
import type {
  CambiosMedioDonacion,
  MedioDonacion,
  NuevoMedioDonacion,
} from "@/modules/donaciones/domain/MedioDonacion";
import type { MedioDonacionRepository } from "@/modules/donaciones/domain/MedioDonacionRepository";

// Implementación del repositorio sobre Prisma. El enum de dominio y el de Prisma
// comparten los mismos valores (misma unión de strings), así que la fila es
// asignable a la entidad de dominio sin conversiones. `orden` asc y luego
// `createdAt` asc dan un orden estable en la vista pública.
const ORDEN = [{ orden: "asc" }, { createdAt: "asc" }] as const;

export class PrismaMedioDonacionRepository
  implements MedioDonacionRepository
{
  async crear(datos: NuevoMedioDonacion): Promise<MedioDonacion> {
    return prisma.medioDonacion.create({
      data: {
        tipo: datos.tipo,
        titular: datos.titular,
        moneda: datos.moneda,
        datos: datos.datos,
        nota: datos.nota,
        ...(datos.orden !== undefined ? { orden: datos.orden } : {}),
      },
    });
  }

  async buscarPorId(id: string): Promise<MedioDonacion | null> {
    return prisma.medioDonacion.findUnique({ where: { id } });
  }

  async listar(): Promise<MedioDonacion[]> {
    return prisma.medioDonacion.findMany({ orderBy: [...ORDEN] });
  }

  async listarPublicables(): Promise<MedioDonacion[]> {
    return prisma.medioDonacion.findMany({
      where: { activo: true },
      orderBy: [...ORDEN],
    });
  }

  async actualizar(
    id: string,
    cambios: CambiosMedioDonacion,
  ): Promise<MedioDonacion> {
    return prisma.medioDonacion.update({ where: { id }, data: cambios });
  }

  async cambiarActivo(id: string, activo: boolean): Promise<MedioDonacion> {
    return prisma.medioDonacion.update({ where: { id }, data: { activo } });
  }
}
