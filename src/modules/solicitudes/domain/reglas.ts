import { esUrgenciaSolicitud } from "./UrgenciaSolicitud";

// Reglas de dominio puras de la Solicitud de ayuda. Sin framework ni Prisma.

/** Normaliza un texto: recorta espacios de los extremos. */
export function normalizarTexto(texto: string): string {
  return texto.trim();
}

export function esSectorValido(sector: string): boolean {
  return normalizarTexto(sector).length > 0;
}

export function esDescripcionValida(descripcion: string): boolean {
  return normalizarTexto(descripcion).length > 0;
}

export function esUrgenciaValida(urgencia: string): boolean {
  return esUrgenciaSolicitud(urgencia);
}

/**
 * La `cantidadEstimada` es opcional; si viene, debe ser un número finito y
 * estrictamente positivo.
 */
export function esCantidadEstimadaValida(cantidad: number | null | undefined): boolean {
  if (cantidad === null || cantidad === undefined) return true;
  return Number.isFinite(cantidad) && cantidad > 0;
}

/** ¿Hay recursos repetidos en la lista de ids? (un recurso por solicitud). */
export function hayRecursosRepetidos(recursoIds: readonly string[]): boolean {
  return new Set(recursoIds).size !== recursoIds.length;
}
