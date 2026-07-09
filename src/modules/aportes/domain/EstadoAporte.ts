// Enum de dominio del Aporte, puro (sin Prisma ni framework). Sus valores coinciden
// con el enum `EstadoAporte` de `prisma/schema.prisma`; la infraestructura mapea
// sin casts porque ambos son la misma unión de strings.

export const EstadoAporte = {
  COMPROMETIDO: "COMPROMETIDO",
  RECIBIDO: "RECIBIDO",
} as const;

export type EstadoAporte = (typeof EstadoAporte)[keyof typeof EstadoAporte];

export const ESTADOS_APORTE: readonly EstadoAporte[] = Object.values(EstadoAporte);

export function esEstadoAporte(valor: string): valor is EstadoAporte {
  return (ESTADOS_APORTE as readonly string[]).includes(valor);
}
