import type { Ayuda } from "@/modules/ayudas/domain/Ayuda";
import type { AyudaDeps } from "./deps";
import { assertEsDueño } from "./deps";
import { AyudaNoEncontradaError } from "./errors";

/**
 * Obtiene el detalle de una Ayuda con sus metas (incluidos los datos del recurso
 * para mostrar nombre/unidad). Si se pasa `adminId` (gestión del panel, feature
 * 022), exige que sea el dueño; sin él, cualquier lector autenticado/público
 * puede ver la actividad (colaborador y transparencia no se aíslan).
 */
export async function obtenerAyuda(
  { ayudas }: Pick<AyudaDeps, "ayudas">,
  id: string,
  adminId?: string,
): Promise<Ayuda> {
  const ayuda = await ayudas.buscarPorId(id);
  if (!ayuda) {
    throw new AyudaNoEncontradaError(id);
  }
  if (adminId !== undefined) {
    assertEsDueño(ayuda, adminId);
  }
  return ayuda;
}
