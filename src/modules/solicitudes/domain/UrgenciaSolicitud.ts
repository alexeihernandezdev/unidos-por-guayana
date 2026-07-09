// Urgencia de una solicitud de ayuda. Tres niveles para priorizar sin paralizar al
// solicitante con una escala numérica. Los valores coinciden con Prisma.

export const UrgenciaSolicitud = {
  BAJA: "BAJA",
  MEDIA: "MEDIA",
  ALTA: "ALTA",
} as const;

export type UrgenciaSolicitud =
  (typeof UrgenciaSolicitud)[keyof typeof UrgenciaSolicitud];

export const URGENCIAS_SOLICITUD: readonly UrgenciaSolicitud[] =
  Object.values(UrgenciaSolicitud);

export function esUrgenciaSolicitud(
  valor: string,
): valor is UrgenciaSolicitud {
  return (URGENCIAS_SOLICITUD as readonly string[]).includes(valor);
}
