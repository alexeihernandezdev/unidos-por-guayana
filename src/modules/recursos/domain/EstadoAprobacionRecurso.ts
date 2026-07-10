// Estado de aprobación del recurso (feature 019). Enum de dominio puro (sin
// Prisma ni framework). Sus valores coinciden con el enum
// `EstadoAprobacionRecurso` de `prisma/schema.prisma`; la infraestructura mapea
// sin casts.

export const EstadoAprobacionRecurso = {
  APROBADO: "APROBADO",
  PROPUESTO: "PROPUESTO",
  RECHAZADO: "RECHAZADO",
} as const;

export type EstadoAprobacionRecurso =
  (typeof EstadoAprobacionRecurso)[keyof typeof EstadoAprobacionRecurso];

export const ESTADOS_APROBACION: readonly EstadoAprobacionRecurso[] =
  Object.values(EstadoAprobacionRecurso);

export function esEstadoAprobacion(
  valor: string,
): valor is EstadoAprobacionRecurso {
  return (ESTADOS_APROBACION as readonly string[]).includes(valor);
}

// Transiciones válidas de la revisión (PROPUESTO es el único origen; APROBADO y
// RECHAZADO son terminales).
export function puedeAprobar(estado: EstadoAprobacionRecurso): boolean {
  return estado === EstadoAprobacionRecurso.PROPUESTO;
}

export function puedeRechazar(estado: EstadoAprobacionRecurso): boolean {
  return estado === EstadoAprobacionRecurso.PROPUESTO;
}
