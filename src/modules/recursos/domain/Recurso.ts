import type { CategoriaRecurso } from "./CategoriaRecurso";

// Entidad de dominio. Un `Recurso` es una referencia estable del catálogo (agua,
// medicinas, un camión, un voluntario, una donación en USD…) medida en su `unidad`.
// No se borra: se archiva con `activo = false` para conservar el histórico.
export type Recurso = {
  id: string;
  nombre: string;
  unidad: string;
  categoria: CategoriaRecurso;
  descripcion: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Datos para dar de alta un recurso. `activo` no se pide: nace en `true` por
// defecto (ver schema).
export type NuevoRecurso = {
  nombre: string;
  unidad: string;
  categoria: CategoriaRecurso;
  descripcion: string | null;
};

// Cambios aplicables al editar un recurso. Todos opcionales: se actualiza solo lo
// que venga. `activo` se alterna por los casos de uso archivar/activar.
export type CambiosRecurso = Partial<{
  nombre: string;
  unidad: string;
  categoria: CategoriaRecurso;
  descripcion: string | null;
  activo: boolean;
}>;
