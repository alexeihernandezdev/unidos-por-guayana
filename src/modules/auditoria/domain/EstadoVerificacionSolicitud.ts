export const EstadoVerificacionSolicitud = {
  PENDIENTE: "PENDIENTE",
  EN_REVISION: "EN_REVISION",
  REQUIERE_INFORMACION: "REQUIERE_INFORMACION",
  VERIFICADA: "VERIFICADA",
  NO_VERIFICADA: "NO_VERIFICADA",
} as const;

export type EstadoVerificacionSolicitud =
  (typeof EstadoVerificacionSolicitud)[keyof typeof EstadoVerificacionSolicitud];

export const ESTADOS_VERIFICACION_SOLICITUD = Object.values(
  EstadoVerificacionSolicitud,
);

export function esEstadoVerificacionSolicitud(
  valor: string,
): valor is EstadoVerificacionSolicitud {
  return ESTADOS_VERIFICACION_SOLICITUD.includes(
    valor as EstadoVerificacionSolicitud,
  );
}

export const ResultadoAuditoria = {
  VERIFICADA: EstadoVerificacionSolicitud.VERIFICADA,
  REQUIERE_INFORMACION: EstadoVerificacionSolicitud.REQUIERE_INFORMACION,
  NO_VERIFICADA: EstadoVerificacionSolicitud.NO_VERIFICADA,
} as const;

export type ResultadoAuditoria =
  (typeof ResultadoAuditoria)[keyof typeof ResultadoAuditoria];

export function esResultadoAuditoria(valor: string): valor is ResultadoAuditoria {
  return Object.values(ResultadoAuditoria).includes(valor as ResultadoAuditoria);
}
