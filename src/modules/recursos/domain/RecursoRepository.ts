import type { CategoriaRecurso } from "./CategoriaRecurso";
import type { CambiosRecurso, NuevoRecurso, Recurso } from "./Recurso";

// Filtro de listado. `soloActivos` deja fuera los archivados (lo que consumirán
// las features 005/006 al elegir recursos); `categoria` acota por categoría.
export type FiltroRecursos = {
  categoria?: CategoriaRecurso;
  soloActivos?: boolean;
};

// Contrato de persistencia de recursos. La implementación concreta (Prisma) vive
// en la capa de infraestructura; el dominio solo define la interfaz.
export interface RecursoRepository {
  crear(datos: NuevoRecurso): Promise<Recurso>;
  listar(filtro?: FiltroRecursos): Promise<Recurso[]>;
  buscarPorId(id: string): Promise<Recurso | null>;
  // Búsqueda por nombre insensible a mayúsculas/espacios, para validar unicidad.
  buscarPorNombre(nombre: string): Promise<Recurso | null>;
  actualizar(id: string, cambios: CambiosRecurso): Promise<Recurso>;
}
