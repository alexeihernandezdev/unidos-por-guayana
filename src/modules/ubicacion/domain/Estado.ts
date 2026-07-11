// Entidad de dominio del catálogo de ubicación (feature 020). Puro: sin Prisma ni
// framework. Un `Estado` es una de las 24 entidades federales de Venezuela.
// `codigo` es la clave natural estable (ISO 3166-2:VE).
export type Estado = {
  id: string;
  codigo: string;
  nombre: string;
};
