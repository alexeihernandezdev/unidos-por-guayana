// Tipos de notificación del alcance (feature 012). Const-object + unión para tener
// los valores como constantes en runtime y el tipo estrecho en compilación. Los
// valores coinciden con el enum `TipoNotificacion` de Prisma para mapear sin casts.
export const TipoNotificacion = {
  NUEVA_ACTIVIDAD: "NUEVA_ACTIVIDAD",
  META_CUMPLIDA: "META_CUMPLIDA",
} as const;

export type TipoNotificacion =
  (typeof TipoNotificacion)[keyof typeof TipoNotificacion];
