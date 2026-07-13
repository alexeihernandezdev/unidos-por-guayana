import type { Actividad } from "./Actividad";

// Reglas de dominio puras de la Actividad. Sin framework ni Prisma.

/** Normaliza un texto: recorta espacios de los extremos. */
export function normalizarTexto(texto: string): string {
  return texto.trim();
}

export function esTituloValido(titulo: string): boolean {
  return normalizarTexto(titulo).length > 0;
}

export function esSectorValido(sector: string): boolean {
  return normalizarTexto(sector).length > 0;
}

/**
 * La `cantidadObjetivo` de una meta debe ser un número finito y estrictamente
 * positivo (en la unidad del recurso). Se guarda como `Decimal` en la base.
 */
export function esCantidadObjetivoValida(cantidad: number): boolean {
  return Number.isFinite(cantidad) && cantidad > 0;
}

/** ¿Hay recursos repetidos en la lista de ids? (una meta por recurso y actividad). */
export function hayRecursosRepetidos(recursoIds: readonly string[]): boolean {
  return new Set(recursoIds).size !== recursoIds.length;
}

/**
 * Normaliza una lista de ids de puntos de acopio (feature 026): recorta cada id,
 * descarta vacíos y elimina duplicados conservando el primer orden de aparición.
 */
export function dedupeIds(ids: readonly string[]): string[] {
  const vistos = new Set<string>();
  const resultado: string[] = [];
  for (const bruto of ids) {
    const id = bruto.trim();
    if (!id || vistos.has(id)) continue;
    vistos.add(id);
    resultado.push(id);
  }
  return resultado;
}

// Descripción opcional: recorta y convierte "" en null para no guardar vacíos.
export function normalizarDescripcion(
  descripcion?: string | null,
): string | null {
  const limpia = descripcion?.trim();
  return limpia ? limpia : null;
}

/** ¿El `adminId` del solicitante es el dueño de la actividad? (feature 022). */
export function esDueño(
  actividad: Pick<Actividad, "adminId">,
  adminId: string,
): boolean {
  return actividad.adminId === adminId;
}
