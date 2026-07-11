// Enums de dominio, puros (sin Prisma ni framework). Sus valores coinciden con el
// enum `EstadoActividad` de `prisma/schema.prisma` (un solo enum en base con la
// unión de las dos secuencias); la infraestructura mapea sin casts. Qué transiciones
// son válidas y cómo se nombra cada estado depende del `tipo` (ver `maquinaEstados`).

// Secuencia de un ENVIO físico (sin cambios respecto a la feature 005).
export const EstadoActividadEnvio = {
  RECOLECTANDO: "RECOLECTANDO",
  LISTO: "LISTO",
  EN_TRANSITO: "EN_TRANSITO",
  ENTREGADO: "ENTREGADO",
} as const;

export type EstadoActividadEnvio =
  (typeof EstadoActividadEnvio)[keyof typeof EstadoActividadEnvio];

// Secuencia de una JORNADA o EVENTO_SOCIAL (feature 024). Misma forma (cuatro pasos,
// un solo sentido); cambia el vocabulario a partir del segundo estado.
export const EstadoActividadEvento = {
  RECOLECTANDO: "RECOLECTANDO",
  LISTA: "LISTA",
  EN_CURSO: "EN_CURSO",
  REALIZADA: "REALIZADA",
} as const;

export type EstadoActividadEvento =
  (typeof EstadoActividadEvento)[keyof typeof EstadoActividadEvento];

// Unión de ambas secuencias: el tipo de la columna `estado` en base. `RECOLECTANDO`
// es el estado inicial compartido, por eso no se duplica.
export const EstadoActividad = {
  RECOLECTANDO: "RECOLECTANDO",
  LISTO: "LISTO",
  EN_TRANSITO: "EN_TRANSITO",
  ENTREGADO: "ENTREGADO",
  LISTA: "LISTA",
  EN_CURSO: "EN_CURSO",
  REALIZADA: "REALIZADA",
} as const;

export type EstadoActividad =
  (typeof EstadoActividad)[keyof typeof EstadoActividad];

// Lista de estados válidos, útil para validar entradas y poblar filtros/selects.
export const ESTADOS_ACTIVIDAD: readonly EstadoActividad[] =
  Object.values(EstadoActividad);

export function esEstadoActividad(valor: string): valor is EstadoActividad {
  return (ESTADOS_ACTIVIDAD as readonly string[]).includes(valor);
}
