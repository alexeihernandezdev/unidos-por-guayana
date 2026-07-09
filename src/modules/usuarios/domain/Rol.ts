// Enums de dominio, puros (sin Prisma ni framework). Sus valores coinciden con
// los enums de `prisma/schema.prisma`; la infraestructura mapea sin casts porque
// ambos son la misma unión de strings.

export const Rol = {
  ADMIN: "ADMIN",
  COLABORADOR: "COLABORADOR",
  SOLICITANTE: "SOLICITANTE",
} as const;

export type Rol = (typeof Rol)[keyof typeof Rol];

export const EstadoVerificacion = {
  PENDIENTE: "PENDIENTE",
  VERIFICADO: "VERIFICADO",
  RECHAZADO: "RECHAZADO",
} as const;

export type EstadoVerificacion =
  (typeof EstadoVerificacion)[keyof typeof EstadoVerificacion];

// Regla de dominio: solo estos roles pueden auto-registrarse desde el registro
// público. `ADMIN` queda fuera (se crea por seed o lo promueve otro `ADMIN`).
export const ROLES_AUTO_REGISTRABLES: readonly Rol[] = [
  Rol.COLABORADOR,
  Rol.SOLICITANTE,
];

export function esRolAutoRegistrable(rol: Rol): boolean {
  return ROLES_AUTO_REGISTRABLES.includes(rol);
}
