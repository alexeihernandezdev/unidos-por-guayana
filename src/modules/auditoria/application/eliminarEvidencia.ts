import type { ActorAuditoria } from "./gestionarAuditoria";
import {
  cargarSolicitudEnRevisionDelAuditor,
  exigirAuditor,
  type EvidenciaAuditoriaDeps,
} from "./evidenciaDeps";
import { EvidenciaNoEncontradaError } from "./errors";

/**
 * Borra una evidencia (objeto en Storage + fila). Solo el auditor que tiene la solicitud
 * en revisión puede hacerlo, y solo sobre evidencia de esa misma solicitud (feature 032).
 */
export async function eliminarEvidencia(
  deps: EvidenciaAuditoriaDeps,
  evidenciaId: string,
  solicitudId: string,
  actor: ActorAuditoria,
): Promise<void> {
  exigirAuditor(actor);
  await cargarSolicitudEnRevisionDelAuditor(
    deps.auditorias,
    solicitudId,
    actor.id,
  );

  const evidencia = await deps.evidencias.buscarEvidenciaPorId(evidenciaId);
  if (!evidencia || evidencia.solicitudId !== solicitudId) {
    throw new EvidenciaNoEncontradaError();
  }

  await deps.storage.eliminar([evidencia.path]);
  await deps.evidencias.eliminarEvidencia(evidencia.id);
}
