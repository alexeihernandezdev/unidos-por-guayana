// Enums de dominio, puros (sin Prisma ni framework). Sus valores coinciden con
// los enums de `prisma/schema.prisma`; la infraestructura mapea sin casts porque
// ambos son la misma unión de strings.

export const Rol = {
  SUPERADMIN: "SUPERADMIN",
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

// Regla de dominio: estos roles pueden auto-registrarse desde el registro
// público. Desde la feature 015 el `ADMIN` es de registro público (nace en
// `PENDIENTE` y no opera hasta que el `SUPERADMIN` lo aprueba). El `SUPERADMIN`
// queda fuera: es la raíz de confianza, se siembra con `pnpm db:seed` y nunca se
// auto-registra ni se promueve desde la app.
export const ROLES_AUTO_REGISTRABLES: readonly Rol[] = [
  Rol.ADMIN,
  Rol.COLABORADOR,
  Rol.SOLICITANTE,
];

export function esRolAutoRegistrable(rol: Rol): boolean {
  return ROLES_AUTO_REGISTRABLES.includes(rol);
}
