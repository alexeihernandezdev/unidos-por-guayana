// Reglas de dominio puras del MedioDonacion (feature 014). Sin framework ni Prisma.

import type { MedioDonacion } from "./MedioDonacion";
import { esMonedaPermitida } from "./Moneda";

// Longitudes máximas de los textos, suficientes para una instrucción de pago sin
// convertirse en un ensayo.
export const MAX_LONGITUD_TITULAR = 160;
export const MAX_LONGITUD_DATOS = 500;
export const MAX_LONGITUD_NOTA_MEDIO = 500;

/** Recorta un texto y devuelve `""` si queda vacío. */
export function normalizarTexto(valor?: string | null): string {
  return valor?.trim() ?? "";
}

/** Nota opcional: recorta y convierte "" en null para no guardar vacíos. */
export function normalizarNotaMedio(nota?: string | null): string | null {
  const limpia = nota?.trim();
  if (!limpia) return null;
  return limpia.slice(0, MAX_LONGITUD_NOTA_MEDIO);
}

/** El titular no puede estar vacío. */
export function esTitularValido(titular: string): boolean {
  return titular.trim().length > 0;
}

/** Los datos de la instrucción (cuenta, correo, alias…) no pueden estar vacíos. */
export function esDatosValido(datos: string): boolean {
  return datos.trim().length > 0;
}

/** La moneda debe pertenecer al conjunto acotado permitido. */
export function esMonedaValida(moneda: string): boolean {
  return esMonedaPermitida(moneda.trim());
}

/**
 * ¿El medio es publicable (visible en superficies públicas / transparencia)?
 * Un medio solo se muestra al público mientras esté `activo`.
 */
export function esPublicable(medio: Pick<MedioDonacion, "activo">): boolean {
  return medio.activo;
}
