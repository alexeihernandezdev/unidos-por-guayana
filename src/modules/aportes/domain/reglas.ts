// Reglas de dominio puras del Aporte. Sin framework ni Prisma.

// Longitud máxima de la nota opcional del aporte. Suficiente para una observación
// corta ("entregado en punto X", "quedó en el depósito", etc.) sin ser un ensayo.
export const MAX_LONGITUD_NOTA = 500;

/**
 * La `cantidad` del aporte debe ser un número finito y estrictamente positivo (en
 * la unidad del recurso). Se guarda como `Decimal` en la base.
 */
export function esCantidadAporteValida(cantidad: number): boolean {
  return Number.isFinite(cantidad) && cantidad > 0;
}

/** Recorta y convierte "" en null para no guardar notas vacías. */
export function normalizarNota(nota?: string | null): string | null {
  const limpia = nota?.trim();
  if (!limpia) return null;
  return limpia.slice(0, MAX_LONGITUD_NOTA);
}

export function esNotaValida(nota: string | null): boolean {
  return nota === null || nota.length <= MAX_LONGITUD_NOTA;
}
