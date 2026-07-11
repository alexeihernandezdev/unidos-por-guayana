// Conjunto acotado de monedas aceptadas (feature 014). Se modela como const-array
// + unión de tipo (no como enum de Prisma) a propósito: aceptar una moneda nueva
// no debe requerir una migración de base. El `monto` se agrega SIEMPRE por moneda;
// la app no convierte divisas (no hay tasa de cambio en el MVP).

export const MONEDAS_PERMITIDAS = ["USD", "VES", "EUR", "USDT"] as const;

export type Moneda = (typeof MONEDAS_PERMITIDAS)[number];

export function esMonedaPermitida(valor: string): valor is Moneda {
  return (MONEDAS_PERMITIDAS as readonly string[]).includes(valor);
}
