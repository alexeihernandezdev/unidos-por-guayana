// Tipos de notificación del alcance (feature 012). Const-object + unión para tener
// los valores como constantes en runtime y el tipo estrecho en compilación. Los
// valores coinciden con el enum `TipoNotificacion` de Prisma para mapear sin casts.
export const TipoNotificacion = {
  NUEVA_ACTIVIDAD: "NUEVA_ACTIVIDAD",
  META_CUMPLIDA: "META_CUMPLIDA",
  NUEVO_APORTE: "NUEVO_APORTE",
  ESTADO_APORTE: "ESTADO_APORTE",
  NUEVA_AFILIACION: "NUEVA_AFILIACION",
  AFILIACION_REMOVIDA: "AFILIACION_REMOVIDA",
  NUEVA_SOLICITUD_ZONA: "NUEVA_SOLICITUD_ZONA",
  ESTADO_SOLICITUD: "ESTADO_SOLICITUD",
  ACTUALIZACION_AUDITORIA: "ACTUALIZACION_AUDITORIA",
  NUEVA_SOLICITUD_AUDITABLE: "NUEVA_SOLICITUD_AUDITABLE",
  RESULTADO_PROPUESTA_RECURSO: "RESULTADO_PROPUESTA_RECURSO",
  RESULTADO_TESTIMONIO: "RESULTADO_TESTIMONIO",
  NUEVO_ADMIN_PENDIENTE: "NUEVO_ADMIN_PENDIENTE",
  ESTADO_CUENTA_ADMIN: "ESTADO_CUENTA_ADMIN",
} as const;

export type TipoNotificacion =
  (typeof TipoNotificacion)[keyof typeof TipoNotificacion];
