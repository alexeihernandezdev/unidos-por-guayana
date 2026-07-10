import type { CategoriaRecurso } from "./CategoriaRecurso";
import type { EstadoAprobacionRecurso } from "./EstadoAprobacionRecurso";

// Entidad de dominio. Un `Recurso` es una referencia estable del catálogo (agua,
// medicinas, un camión, un voluntario, una donación en USD…) medida en su `unidad`.
// No se borra: se archiva con `activo = false` para conservar el histórico.
// `estadoAprobacion` (feature 019) es el ciclo de revisión, independiente de
// `activo`: un recurso solo es seleccionable si es `APROBADO` **y** `activo`.
export type Recurso = {
  id: string;
  nombre: string;
  unidad: string;
  categoria: CategoriaRecurso;
  descripcion: string | null;
  activo: boolean;
  estadoAprobacion: EstadoAprobacionRecurso;
  propuestoPorId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Datos para dar de alta un recurso. `activo` no se pide: nace en `true` por
// defecto (ver schema). `estadoAprobacion` y `propuestoPorId` los fija el caso
// de uso según el origen (admin → APROBADO / null; solicitante → PROPUESTO /
// userId). Si se omiten, se aplica el default del schema: `APROBADO` / `null`.
export type NuevoRecurso = {
  nombre: string;
  unidad: string;
  categoria: CategoriaRecurso;
  descripcion: string | null;
  estadoAprobacion?: EstadoAprobacionRecurso;
  propuestoPorId?: string | null;
};

// Cambios aplicables al editar un recurso. Todos opcionales: se actualiza solo lo
// que venga. `activo` se alterna por archivar/activar; `estadoAprobacion` se
// mueve por los casos de uso aprobar/rechazar (feature 019).
export type CambiosRecurso = Partial<{
  nombre: string;
  unidad: string;
  categoria: CategoriaRecurso;
  descripcion: string | null;
  activo: boolean;
  estadoAprobacion: EstadoAprobacionRecurso;
}>;
