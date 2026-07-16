// Reglas de dominio puras del Aporte. Sin framework ni Prisma.

import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";

// Longitud máxima de la nota opcional del aporte. Suficiente para una observación
// corta ("entregado en punto X", "quedó en el depósito", etc.) sin ser un ensayo.
export const MAX_LONGITUD_NOTA = 500;

// Longitud máxima de la referencia de un ingreso monetario externo (feature 014):
// número de transferencia, código de operación, etc.
export const MAX_LONGITUD_REFERENCIA = 120;

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

// ── Anonimato del aportante (feature 029) ────────────────────────────────────

// Etiqueta que sustituye al nombre en superficies compartidas (registro de
// aportantes 023, transparencia 009) cuando el aporte es anónimo.
export const ETIQUETA_ANONIMO = "Anónimo";

/**
 * Nombre a mostrar en superficies compartidas. Oculta la identidad (devuelve
 * `ETIQUETA_ANONIMO`) cuando el aporte es anónimo o no tiene colaborador (donación
 * directa imputada por el ADMIN). La verdad de la privacidad vive aquí, no en la UI.
 */
export function nombrePublicoAportante(
  esAnonimo: boolean,
  nombreColaborador: string | null,
): string {
  if (esAnonimo || !nombreColaborador) return ETIQUETA_ANONIMO;
  return nombreColaborador;
}

// ── Ingreso monetario externo (feature 014) ─────────────────────────────────

/** ¿La categoría del recurso corresponde a un aporte monetario? */
export function esAporteMonetario(categoria: CategoriaRecurso): boolean {
  return categoria === CategoriaRecurso.MONETARIO;
}

/** El monto de un ingreso monetario debe ser finito y estrictamente positivo. */
export function montoValido(monto: number): boolean {
  return Number.isFinite(monto) && monto > 0;
}

/**
 * La moneda es obligatoria cuando el recurso es `MONETARIO`. Para el resto de
 * categorías no aplica (se guarda `null`).
 */
export function monedaRequeridaSiMonetario(
  categoria: CategoriaRecurso,
  moneda: string | null,
): boolean {
  if (!esAporteMonetario(categoria)) return true;
  return typeof moneda === "string" && moneda.trim().length > 0;
}

/** Recorta y convierte "" en null la referencia opcional del ingreso externo. */
export function normalizarReferencia(
  referencia?: string | null,
): string | null {
  const limpia = referencia?.trim();
  if (!limpia) return null;
  return limpia.slice(0, MAX_LONGITUD_REFERENCIA);
}
