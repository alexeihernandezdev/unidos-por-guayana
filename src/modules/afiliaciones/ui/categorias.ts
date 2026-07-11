import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";

// Etiquetas cortas de las categorías de recurso para la UI de afiliaciones
// (chips de red, editor de categorías, filtro). Feature 025.
export const CATEGORIA_LABEL_CORTA: Record<CategoriaRecurso, string> = {
  [CategoriaRecurso.SUMINISTRO]: "Suministros",
  [CategoriaRecurso.TRANSPORTE]: "Transporte",
  [CategoriaRecurso.PERSONAL]: "Personal",
  [CategoriaRecurso.MONETARIO]: "Monetario",
};
