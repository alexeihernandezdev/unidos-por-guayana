// Tipo de actividad (feature 018). Enum de dominio puro (sin Prisma ni framework).
// Sus valores coinciden con el enum `TipoActividad` de `prisma/schema.prisma`; la
// infraestructura mapea sin casts. Determina la secuencia de estados válida
// (feature 024, ver `maquinaEstados.ts`).

export const TipoActividad = {
  ENVIO: "ENVIO",
  JORNADA: "JORNADA",
  EVENTO_SOCIAL: "EVENTO_SOCIAL",
} as const;

export type TipoActividad = (typeof TipoActividad)[keyof typeof TipoActividad];

export const TIPOS_ACTIVIDAD: readonly TipoActividad[] = Object.values(TipoActividad);

export function esTipoActividad(valor: string): valor is TipoActividad {
  return (TIPOS_ACTIVIDAD as readonly string[]).includes(valor);
}
