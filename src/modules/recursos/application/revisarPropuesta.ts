import {
  EstadoAprobacionRecurso,
  puedeAprobar,
  puedeRechazar,
} from "@/modules/recursos/domain/EstadoAprobacionRecurso";
import type { Recurso } from "@/modules/recursos/domain/Recurso";
import type { RecursoRepository } from "@/modules/recursos/domain/RecursoRepository";
import {
  PropuestaNoEncontradaError,
  TransicionAprobacionInvalidaError,
} from "./errors";

export type RevisarPropuestaDeps = {
  recursos: RecursoRepository;
};

/**
 * Aprueba una propuesta: la mueve de `PROPUESTO` a `APROBADO`. A partir de este
 * momento el recurso es seleccionable en metas y aportes. Solo el ADMIN debe
 * invocar este caso de uso (la protección de rol vive en el límite server).
 */
export async function aprobarPropuesta(
  { recursos }: RevisarPropuestaDeps,
  id: string,
): Promise<Recurso> {
  const actual = await recursos.buscarPorId(id);
  if (!actual) {
    throw new PropuestaNoEncontradaError(id);
  }
  if (!puedeAprobar(actual.estadoAprobacion)) {
    throw new TransicionAprobacionInvalidaError(
      "Solo se puede aprobar un recurso en estado PROPUESTO.",
    );
  }
  return recursos.actualizar(id, {
    estadoAprobacion: EstadoAprobacionRecurso.APROBADO,
  });
}

/**
 * Rechaza una propuesta: la mueve de `PROPUESTO` a `RECHAZADO`. La propuesta se
 * conserva para auditoría pero no vuelve a ser seleccionable. `RECHAZADO` es
 * terminal: si vuelve a hacer falta, se propone de nuevo.
 */
export async function rechazarPropuesta(
  { recursos }: RevisarPropuestaDeps,
  id: string,
): Promise<Recurso> {
  const actual = await recursos.buscarPorId(id);
  if (!actual) {
    throw new PropuestaNoEncontradaError(id);
  }
  if (!puedeRechazar(actual.estadoAprobacion)) {
    throw new TransicionAprobacionInvalidaError(
      "Solo se puede rechazar un recurso en estado PROPUESTO.",
    );
  }
  return recursos.actualizar(id, {
    estadoAprobacion: EstadoAprobacionRecurso.RECHAZADO,
  });
}
