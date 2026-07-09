import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";

// Etiquetas de presentación para cada categoría (el dominio guarda el valor en
// mayúsculas; aquí se traduce a un texto legible en español).
export const CATEGORIA_LABEL: Record<CategoriaRecurso, string> = {
  [CategoriaRecurso.SUMINISTRO]: "Suministro",
  [CategoriaRecurso.TRANSPORTE]: "Transporte",
  [CategoriaRecurso.PERSONAL]: "Personal",
  [CategoriaRecurso.MONETARIO]: "Monetario",
};
