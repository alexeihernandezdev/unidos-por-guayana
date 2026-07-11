import { prisma } from "@/lib/prisma";
import type {
  CentroMapa,
  LectorCentroMapa,
} from "@/modules/acopio/domain/LectorCentroMapa";

// Adaptador Prisma del centro inicial del mapa (feature 011): resuelve
// PerfilAdmin → Estado → coordenadas de la capital sembradas por `db:seed`.
export class PrismaLectorCentroMapa implements LectorCentroMapa {
  async centroPorAdminId(adminId: string): Promise<CentroMapa | null> {
    const perfil = await prisma.perfilAdmin.findUnique({
      where: { usuarioId: adminId },
      select: {
        estadoUbicacion: {
          select: { latitudCapital: true, longitudCapital: true },
        },
      },
    });
    const capital = perfil?.estadoUbicacion;
    if (!capital?.latitudCapital || !capital.longitudCapital) return null;
    return {
      latitud: capital.latitudCapital.toString(),
      longitud: capital.longitudCapital.toString(),
    };
  }
}
