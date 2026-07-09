import { esEliminable } from "@/modules/ayudas/domain/maquinaEstados";
import type { AyudaDeps } from "./deps";
import { AyudaNoEditableError, AyudaNoEncontradaError } from "./errors";

/**
 * Elimina una Ayuda, solo mientras siga en `RECOLECTANDO` (a partir de `LISTO`
 * forma parte del historial y no se borra). Sus metas se borran en cascada.
 */
export async function eliminarAyuda(
  { ayudas }: Pick<AyudaDeps, "ayudas">,
  id: string,
): Promise<void> {
  const ayuda = await ayudas.buscarPorId(id);
  if (!ayuda) {
    throw new AyudaNoEncontradaError(id);
  }
  if (!esEliminable(ayuda.estado)) {
    throw new AyudaNoEditableError(
      "Solo se puede eliminar una ayuda mientras está en RECOLECTANDO.",
    );
  }
  await ayudas.eliminar(id);
}
