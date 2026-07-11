import { prisma } from "@/lib/prisma";
import type { CentroDisponible } from "@/modules/afiliaciones/domain/Afiliacion";
import type {
  FiltroCentros,
  LectorCentrosDisponibles,
} from "@/modules/afiliaciones/domain/LectorCentrosDisponibles";

// Lee los centros de acopio disponibles para afiliarse: cuentas ADMIN VERIFICADO
// que ya tienen su `PerfilAdmin` (nombre de cuenta y ubicación), con sus puntos de
// acopio activos para el drill-down (feature 025). El filtro por ubicación se aplica
// sobre la ubicación del `PerfilAdmin`.
export class PrismaLectorCentrosDisponibles
  implements LectorCentrosDisponibles
{
  async listar(filtro?: FiltroCentros): Promise<CentroDisponible[]> {
    const admins = await prisma.usuario.findMany({
      where: {
        rol: "ADMIN",
        estadoVerificacion: "VERIFICADO",
        perfilAdmin: {
          is: {
            ...(filtro?.estadoId ? { estadoId: filtro.estadoId } : {}),
            ...(filtro?.municipioId ? { municipioId: filtro.municipioId } : {}),
          },
        },
      },
      include: {
        perfilAdmin: {
          include: { estadoUbicacion: true, municipioUbicacion: true },
        },
        puntosAcopio: {
          where: { activo: true },
          orderBy: { nombre: "asc" },
          select: { id: true, nombre: true, referencia: true },
        },
      },
      orderBy: { nombre: "asc" },
    });

    return admins
      .filter((a) => a.perfilAdmin !== null)
      .map((a) => {
        const perfil = a.perfilAdmin!;
        return {
          adminId: a.id,
          nombreCuenta: perfil.nombreCuenta,
          estadoId: perfil.estadoId,
          municipioId: perfil.municipioId,
          estadoNombre: perfil.estadoUbicacion?.nombre ?? null,
          municipioNombre: perfil.municipioUbicacion?.nombre ?? null,
          puntos: a.puntosAcopio.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            referencia: p.referencia,
          })),
        } satisfies CentroDisponible;
      });
  }
}
