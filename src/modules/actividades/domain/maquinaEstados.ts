import { EstadoActividad } from "./EstadoActividad";
import { TipoActividad } from "./TipoActividad";

// Máquina de estados de la Actividad: regla de dominio pura y testeable (sin base ni
// framework). Hay dos secuencias, seleccionadas por `tipo` (feature 024). Ambas
// avanzan en un solo sentido, paso a paso, y comparten `RECOLECTANDO` como inicio:
//   ENVIO:                 RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO
//   JORNADA/EVENTO_SOCIAL: RECOLECTANDO → LISTA → EN_CURSO   → REALIZADA
// No se puede retroceder ni saltar; el último estado de cada secuencia es terminal.

const SECUENCIA_ENVIO: readonly EstadoActividad[] = [
  EstadoActividad.RECOLECTANDO,
  EstadoActividad.LISTO,
  EstadoActividad.EN_TRANSITO,
  EstadoActividad.ENTREGADO,
];

const SECUENCIA_EVENTO: readonly EstadoActividad[] = [
  EstadoActividad.RECOLECTANDO,
  EstadoActividad.LISTA,
  EstadoActividad.EN_CURSO,
  EstadoActividad.REALIZADA,
];

/** Secuencia de estados válida para un `tipo`. `ENVIO` usa la física; el resto la de eventos. */
export function secuenciaDe(tipo: TipoActividad): readonly EstadoActividad[] {
  return tipo === TipoActividad.ENVIO ? SECUENCIA_ENVIO : SECUENCIA_EVENTO;
}

/** Estado al que puede avanzar `estado` según el `tipo`, o `null` si ya es terminal. */
export function siguienteEstado(
  tipo: TipoActividad,
  estado: EstadoActividad,
): EstadoActividad | null {
  const secuencia = secuenciaDe(tipo);
  const i = secuencia.indexOf(estado);
  if (i === -1 || i === secuencia.length - 1) return null;
  return secuencia[i + 1];
}

/**
 * ¿Es válida la transición `desde → hacia` para el `tipo`? Solo el paso inmediato
 * dentro de la secuencia del tipo lo es (rechaza saltos, retrocesos y estados de la
 * otra secuencia).
 */
export function puedeAvanzar(
  tipo: TipoActividad,
  desde: EstadoActividad,
  hacia: EstadoActividad,
): boolean {
  return siguienteEstado(tipo, desde) === hacia;
}

/**
 * Solo en `RECOLECTANDO` se pueden editar cabecera y metas. Tras avanzar quedan
 * congeladas (los aportes cuentan contra un objetivo estable, feature 006).
 * `RECOLECTANDO` es el inicio de ambas secuencias, así que no depende del tipo.
 */
export function esEditable(estado: EstadoActividad): boolean {
  return estado === EstadoActividad.RECOLECTANDO;
}

/** Una Actividad solo se puede eliminar mientras siga en `RECOLECTANDO`. */
export function esEliminable(estado: EstadoActividad): boolean {
  return estado === EstadoActividad.RECOLECTANDO;
}

// Remapeo posicional de un estado de la secuencia de ENVIO a la de EVENTO. Es la
// regla pura detrás del backfill de la migración de la feature 024 (actividades
// JORNADA/EVENTO_SOCIAL que se crearon con el enum de envío). `RECOLECTANDO` es
// compartido y no cambia.
const REMAPEO_ENVIO_A_EVENTO: Record<EstadoActividad, EstadoActividad> = {
  [EstadoActividad.RECOLECTANDO]: EstadoActividad.RECOLECTANDO,
  [EstadoActividad.LISTO]: EstadoActividad.LISTA,
  [EstadoActividad.EN_TRANSITO]: EstadoActividad.EN_CURSO,
  [EstadoActividad.ENTREGADO]: EstadoActividad.REALIZADA,
  // Ya en la secuencia de eventos: identidad.
  [EstadoActividad.LISTA]: EstadoActividad.LISTA,
  [EstadoActividad.EN_CURSO]: EstadoActividad.EN_CURSO,
  [EstadoActividad.REALIZADA]: EstadoActividad.REALIZADA,
};

/** Remapea un estado de envío a su equivalente por posición en la secuencia de eventos. */
export function remapearAEstadoEvento(
  estado: EstadoActividad,
): EstadoActividad {
  return REMAPEO_ENVIO_A_EVENTO[estado];
}
