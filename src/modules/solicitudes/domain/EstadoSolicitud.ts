// Ciclo de vida de una solicitud de ayuda. Avanza desde `ABIERTA` hacia `ATENDIDA` o
// `CERRADA`; ambos son terminales. Los valores coinciden con Prisma.

export const EstadoSolicitud = {
  ABIERTA: "ABIERTA",
  ATENDIDA: "ATENDIDA",
  CERRADA: "CERRADA",
} as const;

export type EstadoSolicitud =
  (typeof EstadoSolicitud)[keyof typeof EstadoSolicitud];

export const ESTADOS_SOLICITUD: readonly EstadoSolicitud[] =
  Object.values(EstadoSolicitud);

export function esEstadoSolicitud(valor: string): valor is EstadoSolicitud {
  return (ESTADOS_SOLICITUD as readonly string[]).includes(valor);
}
