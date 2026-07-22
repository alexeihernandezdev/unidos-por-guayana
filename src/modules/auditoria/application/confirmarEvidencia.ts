import type { ArchivoEvidenciaAuditoria } from "@/modules/auditoria/domain";
import {
  esEvidenciaValida,
  esPathDeEvidencia,
  puedeAgregarEvidencia,
} from "@/modules/auditoria/domain";
import type { ActorAuditoria } from "./gestionarAuditoria";
import {
  cargarSolicitudEnRevisionDelAuditor,
  exigirAuditor,
  type EvidenciaAuditoriaDeps,
} from "./evidenciaDeps";
import { EvidenciaInvalidaError, LimiteEvidenciasError } from "./errors";

export type ConfirmarEvidenciaInput = {
  solicitudId: string;
  path: string;
  nombreOriginal: string;
  contentType: string;
  tamanoBytes: number;
};

/**
 * Persiste los metadatos de una evidencia YA subida. Revalida permisos, tipo, tamaño y
 * que el `path` pertenezca a esta solicitud (defensa ante paths inyectados). Guarda el
 * ciclo de auditoría vigente (feature 032).
 */
export async function confirmarEvidencia(
  deps: EvidenciaAuditoriaDeps,
  input: ConfirmarEvidenciaInput,
  actor: ActorAuditoria,
): Promise<ArchivoEvidenciaAuditoria> {
  exigirAuditor(actor);
  const solicitud = await cargarSolicitudEnRevisionDelAuditor(
    deps.auditorias,
    input.solicitudId,
    actor.id,
  );

  if (!esPathDeEvidencia(input.path, input.solicitudId)) {
    throw new EvidenciaInvalidaError("La ruta de la evidencia no es válida.");
  }
  if (!esEvidenciaValida(input.contentType, input.tamanoBytes)) {
    throw new EvidenciaInvalidaError(
      "La evidencia debe ser imagen, video o PDF, y pesar 50 MB o menos.",
    );
  }

  const cantidad = await deps.evidencias.contarEvidencias(input.solicitudId);
  if (!puedeAgregarEvidencia(cantidad)) {
    throw new LimiteEvidenciasError(
      "Has alcanzado el máximo de 15 evidencias.",
    );
  }

  return deps.evidencias.crearEvidencia({
    solicitudId: input.solicitudId,
    subidoPorId: actor.id,
    ciclo: solicitud.cicloAuditoria,
    path: input.path,
    nombreOriginal: input.nombreOriginal,
    contentType: input.contentType,
    tamanoBytes: input.tamanoBytes,
  });
}
