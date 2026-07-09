import { EstadoAyuda } from "./EstadoAyuda";

// Máquina de estados de la Ayuda: regla de dominio pura y testeable (sin base ni
// framework). El ciclo de vida avanza en un solo sentido y paso a paso:
//   RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO
// No se puede retroceder ni saltar; `ENTREGADO` es terminal.

// Siguiente estado válido desde cada estado, o `null` si es terminal.
export const TRANSICIONES: Record<EstadoAyuda, EstadoAyuda | null> = {
  [EstadoAyuda.RECOLECTANDO]: EstadoAyuda.LISTO,
  [EstadoAyuda.LISTO]: EstadoAyuda.EN_TRANSITO,
  [EstadoAyuda.EN_TRANSITO]: EstadoAyuda.ENTREGADO,
  [EstadoAyuda.ENTREGADO]: null,
};

/** Estado al que puede avanzar `estado`, o `null` si ya es terminal. */
export function siguienteEstado(estado: EstadoAyuda): EstadoAyuda | null {
  return TRANSICIONES[estado];
}

/** ¿Es válida la transición `desde → hacia`? Solo el paso inmediato lo es. */
export function puedeAvanzar(desde: EstadoAyuda, hacia: EstadoAyuda): boolean {
  return siguienteEstado(desde) === hacia;
}

/**
 * Solo en `RECOLECTANDO` se pueden editar cabecera y metas. Tras pasar a `LISTO`
 * quedan congeladas (los aportes cuentan contra un objetivo estable, feature 006).
 */
export function esEditable(estado: EstadoAyuda): boolean {
  return estado === EstadoAyuda.RECOLECTANDO;
}

/** Una Ayuda solo se puede eliminar mientras siga en `RECOLECTANDO`. */
export function esEliminable(estado: EstadoAyuda): boolean {
  return estado === EstadoAyuda.RECOLECTANDO;
}
