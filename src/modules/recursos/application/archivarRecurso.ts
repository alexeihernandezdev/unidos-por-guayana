import type { Recurso } from "@/modules/recursos/domain/Recurso";
import type { RecursoRepository } from "@/modules/recursos/domain/RecursoRepository";
import { RecursoNoEncontradoError } from "./errors";

export type CambiarActivoDeps = {
  recursos: RecursoRepository;
};

// Archivar/activar comparten lógica: alternar `activo`. Se archivan (soft) en vez
// de borrar para no dejar huérfanas las metas/aportes futuros (features 005/006).
async function cambiarActivo(
  { recursos }: CambiarActivoDeps,
  id: string,
  activo: boolean,
): Promise<Recurso> {
  const actual = await recursos.buscarPorId(id);
  if (!actual) {
    throw new RecursoNoEncontradoError(id);
  }
  return recursos.actualizar(id, { activo });
}

/** Archiva un recurso (`activo = false`): deja de ofrecerse pero se conserva. */
export function archivarRecurso(
  deps: CambiarActivoDeps,
  id: string,
): Promise<Recurso> {
  return cambiarActivo(deps, id, false);
}

/** Reactiva un recurso archivado (`activo = true`). */
export function activarRecurso(
  deps: CambiarActivoDeps,
  id: string,
): Promise<Recurso> {
  return cambiarActivo(deps, id, true);
}
