import { prisma } from "@/lib/prisma";
import type {
  Estado,
  Municipio,
} from "@/modules/ubicaciones/domain/Ubicacion";
import type { UbicacionRepository } from "@/modules/ubicaciones/domain/UbicacionRepository";

export class PrismaUbicacionRepository implements UbicacionRepository {
  async listarEstados(): Promise<Estado[]> {
    return prisma.estado.findMany({ orderBy: { nombre: "asc" } });
  }

  async listarMunicipiosPorEstado(estadoId: string): Promise<Municipio[]> {
    return prisma.municipio.findMany({
      where: { estadoId },
      orderBy: { nombre: "asc" },
    });
  }

  async obtenerEstado(id: string): Promise<Estado | null> {
    return prisma.estado.findUnique({ where: { id } });
  }

  async obtenerMunicipio(id: string): Promise<Municipio | null> {
    return prisma.municipio.findUnique({ where: { id } });
  }
}
