import { esEliminable } from "@/modules/ayudas/domain/maquinaEstados";
import { type AyudaDeps, assertEsDueño } from "./deps";
import { AyudaNoEditableError, AyudaNoEncontradaError } from "./errors";

/**
 * Elimina una Ayuda, solo mientras siga en `RECOLECTANDO` y pertenezca al
 * `adminId` solicitante (feature 022). A partir de `LISTO` forma parte del
 * historial y no se borra. Sus metas se borran en cascada.
 */
export async function eliminarAyuda(
  { ayudas }: Pick<AyudaDeps, "ayudas">,
  id: string,
  adminId: string,
): Promise<void> {
  const ayuda = await ayudas.buscarPorId(id);
  if (!ayuda) {
    throw new AyudaNoEncontradaError(id);
  }
  assertEsDueño(ayuda, adminId);
  if (!esEliminable(ayuda.estado)) {
    throw new AyudaNoEditableError(
      "Solo se puede eliminar una ayuda mientras está en RECOLECTANDO.",
    );
  }
  await ayudas.eliminar(id);
}
