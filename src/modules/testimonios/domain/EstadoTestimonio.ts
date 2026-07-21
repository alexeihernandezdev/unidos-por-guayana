export const EstadoTestimonio = {
  PENDIENTE: "PENDIENTE",
  APROBADO: "APROBADO",
  RECHAZADO: "RECHAZADO",
  OCULTO: "OCULTO",
} as const;

export type EstadoTestimonio =
  (typeof EstadoTestimonio)[keyof typeof EstadoTestimonio];

export const ESTADOS_TESTIMONIO: readonly EstadoTestimonio[] =
  Object.values(EstadoTestimonio);

export function esEstadoTestimonio(valor: string): valor is EstadoTestimonio {
  return (ESTADOS_TESTIMONIO as readonly string[]).includes(valor);
}
