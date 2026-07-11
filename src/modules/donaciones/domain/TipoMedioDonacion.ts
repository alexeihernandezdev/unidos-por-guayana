// Enum de dominio del tipo de medio de donación monetaria externa (feature 014),
// puro (sin Prisma ni framework). Sus valores coinciden con el enum
// `TipoMedioDonacion` de `prisma/schema.prisma`; la infraestructura mapea sin
// casts porque ambos son la misma unión de strings.

export const TipoMedioDonacion = {
  CUENTA_BANCARIA: "CUENTA_BANCARIA",
  PAGO_MOVIL: "PAGO_MOVIL",
  PAYPAL: "PAYPAL",
  ZELLE: "ZELLE",
  BINANCE: "BINANCE",
  EFECTIVO: "EFECTIVO",
  OTRO: "OTRO",
} as const;

export type TipoMedioDonacion =
  (typeof TipoMedioDonacion)[keyof typeof TipoMedioDonacion];

// Lista de tipos válidos, útil para validar entradas y poblar selects.
export const TIPOS_MEDIO_DONACION: readonly TipoMedioDonacion[] =
  Object.values(TipoMedioDonacion);

export function esTipoMedioDonacion(valor: string): valor is TipoMedioDonacion {
  return (TIPOS_MEDIO_DONACION as readonly string[]).includes(valor);
}
