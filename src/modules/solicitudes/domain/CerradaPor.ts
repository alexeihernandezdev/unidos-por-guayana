// Quién cerró la solicitud. Distingue cancelación del solicitante de cierre
// administrativo por el ADMIN. Los valores coinciden con Prisma.

export const CerradaPor = {
  SOLICITANTE: "SOLICITANTE",
  ADMIN: "ADMIN",
} as const;

export type CerradaPor = (typeof CerradaPor)[keyof typeof CerradaPor];

export const CERRADA_POR_VALORES: readonly CerradaPor[] =
  Object.values(CerradaPor);

export function esCerradaPor(valor: string): valor is CerradaPor {
  return (CERRADA_POR_VALORES as readonly string[]).includes(valor);
}
