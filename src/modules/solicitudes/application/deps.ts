import type { RecursoRepository } from "@/modules/recursos/domain/RecursoRepository";
import type { SolicitudRepository } from "@/modules/solicitudes/domain/SolicitudRepository";
import { esCantidadEstimadaValida } from "@/modules/solicitudes/domain/reglas";
import { DatosSolicitudInvalidosError, RecursoInvalidoError } from "./errors";

export type SolicitudDeps = {
  solicitudes: SolicitudRepository;
  recursos: RecursoRepository;
};

/**
 * Valida un recurso de solicitud: si viene `cantidadEstimada`, debe ser positiva y el
 * recurso debe existir y estar activo en el catálogo.
 */
export async function validarRecursoSolicitud(
  recursos: RecursoRepository,
  recursoId: string,
  cantidadEstimada?: number | null,
): Promise<void> {
  if (!esCantidadEstimadaValida(cantidadEstimada)) {
    throw new DatosSolicitudInvalidosError(
      "La cantidad estimada debe ser mayor que cero.",
    );
  }

  const recurso = await recursos.buscarPorId(recursoId);
  if (!recurso) {
    throw new RecursoInvalidoError("El recurso indicado no existe.");
  }
  if (!recurso.activo) {
    throw new RecursoInvalidoError(
      `El recurso "${recurso.nombre}" está archivado y no puede usarse en una solicitud.`,
    );
  }
}
