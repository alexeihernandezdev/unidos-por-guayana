// Enum de dominio, puro (sin Prisma ni framework). Sus valores coinciden con el
// enum `EstadoAyuda` de `prisma/schema.prisma`; la infraestructura mapea sin casts
// porque ambos son la misma unión de strings (igual que `Rol` en usuarios).

export const EstadoAyuda = {
  RECOLECTANDO: "RECOLECTANDO",
  LISTO: "LISTO",
  EN_TRANSITO: "EN_TRANSITO",
  ENTREGADO: "ENTREGADO",
} as const;

export type EstadoAyuda = (typeof EstadoAyuda)[keyof typeof EstadoAyuda];

// Lista de estados válidos, útil para validar entradas y poblar filtros/selects.
export const ESTADOS_AYUDA: readonly EstadoAyuda[] = Object.values(EstadoAyuda);

export function esEstadoAyuda(valor: string): valor is EstadoAyuda {
  return (ESTADOS_AYUDA as readonly string[]).includes(valor);
}
