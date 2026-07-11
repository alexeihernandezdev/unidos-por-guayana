import { prisma } from "@/lib/prisma";
import type { LectorUbicacionAdmin } from "@/modules/acopio/domain/LectorUbicacionAdmin";

// Adaptador Prisma del puerto que lee la ubicación del `PerfilAdmin` para
// heredarla al crear un `PuntoAcopio` (feature 011). En base, `estadoId` y
// `municipioId` son nullable (perfiles creados antes de 020); si alguno está
// vacío, devolvemos `null` para que la aplicación lo trate como "perfil sin
// ubicación" y exija completarlo.
export class PrismaLectorUbicacionAdmin implements LectorUbicacionAdmin {
  async leerPorAdminId(
    adminId: string,
  ): Promise<{ estadoId: string; municipioId: string } | null> {
    const fila = await prisma.perfilAdmin.findUnique({
      where: { usuarioId: adminId },
      select: { estadoId: true, municipioId: true },
    });
    if (!fila || !fila.estadoId || !fila.municipioId) return null;
    return { estadoId: fila.estadoId, municipioId: fila.municipioId };
  }
}
