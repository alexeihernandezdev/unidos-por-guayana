import { EstadoAprobacionRecurso } from "@/modules/recursos/domain/EstadoAprobacionRecurso";
import type { Recurso } from "@/modules/recursos/domain/Recurso";
import type { RecursoRepository } from "@/modules/recursos/domain/RecursoRepository";

export type ListarPropuestasDeps = {
  recursos: RecursoRepository;
};

/**
 * Lista los recursos en estado `PROPUESTO` para la bandeja de revisión del
 * ADMIN (feature 019). Es un caso de uso puro: la protección por rol vive en el
 * límite server.
 */
export async function listarPropuestas({
  recursos,
}: ListarPropuestasDeps): Promise<Recurso[]> {
  return recursos.listar({
    estadoAprobacion: EstadoAprobacionRecurso.PROPUESTO,
  });
}
