import type { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import {
  EstadoActividad as Estados,
  ESTADOS_ACTIVIDAD,
} from "@/modules/actividades/domain/EstadoActividad";
import type { ActividadDeps } from "./deps";
import type { FiltroActividades } from "@/modules/actividades/domain/ActividadRepository";

export type ConteosPorEstadoActividad = Record<EstadoActividad, number>;

// Orden canónico de estados para listados/filtros: primero la secuencia de envío,
// luego los estados propios de jornada/evento (feature 024).
const ESTADOS: EstadoActividad[] = [...ESTADOS_ACTIVIDAD];

// Conteos en cero para todos los estados posibles (las dos secuencias).
function conteosVacios(): ConteosPorEstadoActividad {
  return ESTADOS_ACTIVIDAD.reduce((acc, estado) => {
    acc[estado] = 0;
    return acc;
  }, {} as ConteosPorEstadoActividad);
}

/**
 * Cuenta actividades agrupadas por estado del ciclo de vida. Con `adminId` acota al
 * dueño (panel del ADMIN, feature 022); sin él cuenta la red completa
 * (transparencia pública).
 */
export async function contarActividadesPorEstado(
  { actividades }: Pick<ActividadDeps, "actividades">,
  filtro?: FiltroActividades,
): Promise<ConteosPorEstadoActividad> {
  const todas = await actividades.listar(filtro);
  const conteos = conteosVacios();
  for (const actividad of todas) {
    conteos[actividad.estado]++;
  }
  return conteos;
}

/**
 * Conteos solo de las etapas "activas" de un envío (excluye ENTREGADO). Se conserva
 * para el bloque de envíos del panel (feature 008); las actividades de tipo evento
 * usan sus propios estados (LISTA/EN_CURSO/REALIZADA) y no entran aquí.
 */
export function contarEnviosActivos(
  conteos: ConteosPorEstadoActividad,
): Pick<ConteosPorEstadoActividad, "RECOLECTANDO" | "LISTO" | "EN_TRANSITO"> {
  return {
    [Estados.RECOLECTANDO]: conteos[Estados.RECOLECTANDO],
    [Estados.LISTO]: conteos[Estados.LISTO],
    [Estados.EN_TRANSITO]: conteos[Estados.EN_TRANSITO],
  };
}

export { ESTADOS as ESTADOS_ACTIVIDAD_ORDEN };
