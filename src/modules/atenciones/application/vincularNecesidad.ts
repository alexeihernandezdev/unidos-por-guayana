import { esCantidadObjetivoValida } from "@/modules/actividades/domain/reglas";
import { type AtencionDeps, assertActividadOperable } from "./deps";
import {
  NecesidadNoEncontradaError,
  NecesidadNoPendienteError,
  NecesidadYaAtendidaError,
  RecursoNoSeleccionableError,
} from "./errors";

/**
 * Vincula una necesidad (`RecursoSolicitud`) a una actividad: crea (o reutiliza) la meta
 * del recurso en la actividad y registra la `AtencionNecesidad`. Reglas:
 * 1. La actividad existe, es del ADMIN y sigue en `RECOLECTANDO`.
 * 2. La necesidad existe, su solicitud está `ABIERTA` y aún no está atendida.
 * 3. El recurso es seleccionable (`APROBADO` y `activo`).
 * 4. La meta se crea con la `cantidadEstimada` de la necesidad como objetivo (editable
 *    después); si no hay estimación válida, arranca en 1. Si la meta ya existe, su
 *    cantidad no se toca (decisión de diseño: el ADMIN la ajusta aparte).
 */
export async function vincularNecesidad(
  { atenciones, actividades }: AtencionDeps,
  actividadId: string,
  adminId: string,
  recursoSolicitudId: string,
): Promise<void> {
  await assertActividadOperable(actividades, actividadId, adminId);

  const necesidad = await atenciones.buscarNecesidad(recursoSolicitudId);
  if (!necesidad) {
    throw new NecesidadNoEncontradaError(recursoSolicitudId);
  }
  if (!necesidad.solicitudAbierta) {
    throw new NecesidadNoPendienteError();
  }
  if (necesidad.yaAtendida) {
    throw new NecesidadYaAtendidaError();
  }
  if (!necesidad.recursoSeleccionable) {
    throw new RecursoNoSeleccionableError(necesidad.recursoNombre);
  }

  const cantidadObjetivo = esCantidadObjetivoValida(
    necesidad.cantidadEstimada ?? 0,
  )
    ? (necesidad.cantidadEstimada as number)
    : 1;

  await atenciones.vincular({
    recursoSolicitudId,
    actividadId,
    recursoId: necesidad.recursoId,
    cantidadObjetivo,
  });
}

// Resultado de un vínculo en lote (alta de actividad): qué necesidades no pudieron
// atenderse y por qué (p. ej. otra actividad las tomó entre el arrastre y el submit).
export type NecesidadFallida = {
  recursoSolicitudId: string;
  motivo: string;
};

/**
 * Vincula varias necesidades a una actividad recién creada (caso de alta). Es tolerante
 * a fallos por necesidad: intenta todas y devuelve las que fallaron, para que la app
 * avise sin abortar la creación ya persistida. El orden se conserva.
 */
export async function vincularNecesidades(
  deps: AtencionDeps,
  actividadId: string,
  adminId: string,
  recursoSolicitudIds: readonly string[],
): Promise<NecesidadFallida[]> {
  const fallidas: NecesidadFallida[] = [];
  for (const recursoSolicitudId of recursoSolicitudIds) {
    try {
      await vincularNecesidad(deps, actividadId, adminId, recursoSolicitudId);
    } catch (error) {
      fallidas.push({
        recursoSolicitudId,
        motivo:
          error instanceof Error ? error.message : "Error desconocido.",
      });
    }
  }
  return fallidas;
}
