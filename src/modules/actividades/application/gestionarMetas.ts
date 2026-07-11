import type { Actividad } from "@/modules/actividades/domain/Actividad";
import { esEditable } from "@/modules/actividades/domain/maquinaEstados";
import { type ActividadDeps, assertEsDueño, validarMeta } from "./deps";
import { ActividadNoEditableError, ActividadNoEncontradaError } from "./errors";

// Gestión de metas de una Actividad. Todas las operaciones solo se permiten mientras la
// Actividad sigue en `RECOLECTANDO` (después las metas quedan congeladas) y pertenece
// al ADMIN solicitante (feature 022).

async function actividadEditableDelDueño(
  actividades: ActividadDeps["actividades"],
  id: string,
  adminId: string,
): Promise<Actividad> {
  const ayuda = await actividades.buscarPorId(id);
  if (!ayuda) {
    throw new ActividadNoEncontradaError(id);
  }
  assertEsDueño(ayuda, adminId);
  if (!esEditable(ayuda.estado)) {
    throw new ActividadNoEditableError(
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
  { actividades, recursos }: ActividadDeps,
  actividadId: string,
  adminId: string,
  meta: { recursoId: string; cantidadObjetivo: number },
): Promise<Actividad> {
  await actividadEditableDelDueño(actividades, actividadId, adminId);
  await validarMeta(recursos, meta.recursoId, meta.cantidadObjetivo);
  return actividades.upsertMeta(actividadId, meta);
}

/** Quita la meta del recurso indicado. Solo en `RECOLECTANDO` y del dueño. */
export async function quitarMeta(
  { actividades }: Pick<ActividadDeps, "actividades">,
  actividadId: string,
  adminId: string,
  recursoId: string,
): Promise<Actividad> {
  await actividadEditableDelDueño(actividades, actividadId, adminId);
  return actividades.quitarMeta(actividadId, recursoId);
}
