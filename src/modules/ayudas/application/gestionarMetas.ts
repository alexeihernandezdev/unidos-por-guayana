import type { Ayuda } from "@/modules/ayudas/domain/Ayuda";
import { esEditable } from "@/modules/ayudas/domain/maquinaEstados";
import { type AyudaDeps, validarMeta } from "./deps";
import { AyudaNoEditableError, AyudaNoEncontradaError } from "./errors";

// Gestión de metas de una Ayuda. Todas las operaciones solo se permiten mientras la
// Ayuda sigue en `RECOLECTANDO` (después las metas quedan congeladas).

async function ayudaEditable(
  ayudas: AyudaDeps["ayudas"],
  id: string,
): Promise<Ayuda> {
  const ayuda = await ayudas.buscarPorId(id);
  if (!ayuda) {
    throw new AyudaNoEncontradaError(id);
  }
  if (!esEditable(ayuda.estado)) {
    throw new AyudaNoEditableError(
      "Solo se pueden gestionar las metas mientras la ayuda está en RECOLECTANDO.",
    );
  }
  return ayuda;
}

/**
 * Añade una meta o, si ya existe una para ese recurso, actualiza su objetivo
 * (única por [ayuda, recurso]). Valida cantidad positiva y recurso activo.
 */
export async function guardarMeta(
  { ayudas, recursos }: AyudaDeps,
  ayudaId: string,
  meta: { recursoId: string; cantidadObjetivo: number },
): Promise<Ayuda> {
  await ayudaEditable(ayudas, ayudaId);
  await validarMeta(recursos, meta.recursoId, meta.cantidadObjetivo);
  return ayudas.upsertMeta(ayudaId, meta);
}

/** Quita la meta del recurso indicado. Solo en `RECOLECTANDO`. */
export async function quitarMeta(
  { ayudas }: Pick<AyudaDeps, "ayudas">,
  ayudaId: string,
  recursoId: string,
): Promise<Ayuda> {
  await ayudaEditable(ayudas, ayudaId);
  return ayudas.quitarMeta(ayudaId, recursoId);
}
