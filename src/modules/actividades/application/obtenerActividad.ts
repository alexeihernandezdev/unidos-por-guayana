import type { Actividad } from "@/modules/actividades/domain/Actividad";
import type { ActividadDeps } from "./deps";
import { assertEsDueño } from "./deps";
import { ActividadNoEncontradaError } from "./errors";

/**
 * Obtiene el detalle de una Actividad con sus metas (incluidos los datos del recurso
 * para mostrar nombre/unidad). Si se pasa `adminId` (gestión del panel, feature
 * 022), exige que sea el dueño; sin él, cualquier lector autenticado/público
 * puede ver la actividad (colaborador y transparencia no se aíslan).
 */
export async function obtenerActividad(
  { actividades }: Pick<ActividadDeps, "actividades">,
  id: string,
  adminId?: string,
): Promise<Actividad> {
  const ayuda = await actividades.buscarPorId(id);
  if (!ayuda) {
    throw new ActividadNoEncontradaError(id);
  }
  if (adminId !== undefined) {
    assertEsDueño(ayuda, adminId);
  }
  return ayuda;
}
