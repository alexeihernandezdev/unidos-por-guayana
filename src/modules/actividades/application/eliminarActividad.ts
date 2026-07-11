import { esEliminable } from "@/modules/actividades/domain/maquinaEstados";
import { type ActividadDeps, assertEsDueño } from "./deps";
import { ActividadNoEditableError, ActividadNoEncontradaError } from "./errors";

/**
 * Elimina una Actividad, solo mientras siga en `RECOLECTANDO` y pertenezca al
 * `adminId` solicitante (feature 022). A partir de `LISTO` forma parte del
 * historial y no se borra. Sus metas se borran en cascada.
 */
export async function eliminarActividad(
  { actividades }: Pick<ActividadDeps, "actividades">,
  id: string,
  adminId: string,
): Promise<void> {
  const ayuda = await actividades.buscarPorId(id);
  if (!ayuda) {
    throw new ActividadNoEncontradaError(id);
  }
  assertEsDueño(ayuda, adminId);
  if (!esEliminable(ayuda.estado)) {
    throw new ActividadNoEditableError(
      "Solo se puede eliminar una ayuda mientras está en RECOLECTANDO.",
    );
  }
  await actividades.eliminar(id);
}
