import { prisma } from "@/lib/prisma";
import type {
  Estado,
  Municipio,
} from "@/modules/ubicacion/domain/Ubicacion";
import type { UbicacionRepository } from "@/modules/ubicacion/domain/UbicacionRepository";

export class PrismaUbicacionRepository implements UbicacionRepository {
  async listarEstados(): Promise<Estado[]> {
    return prisma.estadoVenezuela.findMany({
      orderBy: { nombre: "asc" },
    });
  }

  async listarMunicipiosPorEstado(estadoId: string): Promise<Municipio[]> {
    return prisma.municipioVenezuela.findMany({
      where: { estadoId },
      orderBy: { nombre: "asc" },
    });
  }

  async listarTodosLosMunicipios(): Promise<Municipio[]> {
    return prisma.municipioVenezuela.findMany({
      orderBy: [{ estadoId: "asc" }, { nombre: "asc" }],
    });
  }

  async buscarMunicipioPorId(id: string): Promise<Municipio | null> {
    return prisma.municipioVenezuela.findUnique({ where: { id } });
  }
}
