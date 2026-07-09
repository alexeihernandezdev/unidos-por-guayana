import type { Ayuda } from "@/modules/ayudas/domain/Ayuda";
import type { AyudaDeps } from "./deps";
import { AyudaNoEncontradaError } from "./errors";

/**
 * Obtiene el detalle de una Ayuda con sus metas (incluidos los datos del recurso
 * para mostrar nombre/unidad). Lanza `AyudaNoEncontradaError` si no existe.
 */
export async function obtenerAyuda(
  { ayudas }: Pick<AyudaDeps, "ayudas">,
  id: string,
): Promise<Ayuda> {
  const ayuda = await ayudas.buscarPorId(id);
  if (!ayuda) {
    throw new AyudaNoEncontradaError(id);
  }
  return ayuda;
}
