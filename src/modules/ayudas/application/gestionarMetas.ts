import type { Ayuda } from "@/modules/ayudas/domain/Ayuda";
import { esEditable } from "@/modules/ayudas/domain/maquinaEstados";
import { type AyudaDeps, assertEsDueño, validarMeta } from "./deps";
import { AyudaNoEditableError, AyudaNoEncontradaError } from "./errors";

// Gestión de metas de una Ayuda. Todas las operaciones solo se permiten mientras la
// Ayuda sigue en `RECOLECTANDO` (después las metas quedan congeladas) y pertenece
// al ADMIN solicitante (feature 022).

async function ayudaEditableDelDueño(
  ayudas: AyudaDeps["ayudas"],
  id: string,
  adminId: string,
): Promise<Ayuda> {
  const ayuda = await ayudas.buscarPorId(id);
  if (!ayuda) {
    throw new AyudaNoEncontradaError(id);
  }
  assertEsDueño(ayuda, adminId);
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
  adminId: string,
  meta: { recursoId: string; cantidadObjetivo: number },
): Promise<Ayuda> {
  await ayudaEditableDelDueño(ayudas, ayudaId, adminId);
  await validarMeta(recursos, meta.recursoId, meta.cantidadObjetivo);
  return ayudas.upsertMeta(ayudaId, meta);
}

/** Quita la meta del recurso indicado. Solo en `RECOLECTANDO` y del dueño. */
export async function quitarMeta(
  { ayudas }: Pick<AyudaDeps, "ayudas">,
  ayudaId: string,
  adminId: string,
  recursoId: string,
): Promise<Ayuda> {
  await ayudaEditableDelDueño(ayudas, ayudaId, adminId);
  return ayudas.quitarMeta(ayudaId, recursoId);
}
