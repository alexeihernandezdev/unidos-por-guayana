import type { Recurso } from "@/modules/recursos/domain/Recurso";
import type {
  FiltroRecursos,
  RecursoRepository,
} from "@/modules/recursos/domain/RecursoRepository";

export type ListarRecursosDeps = {
  recursos: RecursoRepository;
};

/**
 * Lista los recursos del catálogo, opcionalmente filtrados por categoría y/o solo
 * activos. Sin filtro devuelve todos (incluidos los archivados) para el listado de
 * gestión. Las features 005/006 usarán `{ soloActivos: true }` al elegir recursos.
 */
export async function listarRecursos(
  { recursos }: ListarRecursosDeps,
  filtro?: FiltroRecursos,
): Promise<Recurso[]> {
  return recursos.listar(filtro);
}
