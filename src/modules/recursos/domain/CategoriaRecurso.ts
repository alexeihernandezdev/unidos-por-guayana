// Enum de dominio, puro (sin Prisma ni framework). Sus valores coinciden con el
// enum `CategoriaRecurso` de `prisma/schema.prisma`; la infraestructura mapea sin
// casts porque ambos son la misma unión de strings (igual que `Rol` en usuarios).

export const CategoriaRecurso = {
  SUMINISTRO: "SUMINISTRO",
  TRANSPORTE: "TRANSPORTE",
  PERSONAL: "PERSONAL",
  MONETARIO: "MONETARIO",
} as const;

export type CategoriaRecurso =
  (typeof CategoriaRecurso)[keyof typeof CategoriaRecurso];

// Lista de categorías válidas, útil para validar entradas y poblar selects.
export const CATEGORIAS_RECURSO: readonly CategoriaRecurso[] =
  Object.values(CategoriaRecurso);

export function esCategoriaRecurso(valor: string): valor is CategoriaRecurso {
  return (CATEGORIAS_RECURSO as readonly string[]).includes(valor);
}
