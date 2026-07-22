import type { StoragePort } from "@/modules/archivos/domain/StoragePort";
import type {
  AuditoriaRepository,
  EvidenciaAuditoriaRepository,
  SolicitudAuditable,
} from "@/modules/auditoria/domain";
import { EstadoVerificacionSolicitud } from "@/modules/auditoria/domain";
import { Rol } from "@/modules/usuarios/domain/Rol";
import type { ActorAuditoria } from "./gestionarAuditoria";
import {
  ConflictoAuditoriaError,
  SolicitudAuditoriaNoEncontradaError,
  SoloAuditorError,
} from "./errors";

/**
 * Dependencias de los casos de uso de evidencia (feature 032). `auditorias` solo se usa
 * para leer el estado de auditoría de la solicitud; `evidencias` para el CRUD; `storage`
 * para firmar/borrar en el bucket.
 */
export type EvidenciaAuditoriaDeps = {
  auditorias: Pick<AuditoriaRepository, "buscarPorId">;
  evidencias: EvidenciaAuditoriaRepository;
  storage: StoragePort;
};

export function exigirAuditor(actor: ActorAuditoria): void {
  if (actor.rol !== Rol.AUDITOR) throw new SoloAuditorError();
}

/**
 * Carga la solicitud y comprueba que está EN_REVISION reservada para `auditorId`. Solo el
 * auditor que la tiene tomada puede gestionar su evidencia; en cualquier otro estado se
 * lanza `ConflictoAuditoriaError`.
 */
export async function cargarSolicitudEnRevisionDelAuditor(
  auditorias: Pick<AuditoriaRepository, "buscarPorId">,
  solicitudId: string,
  auditorId: string,
): Promise<SolicitudAuditable> {
  const solicitud = await auditorias.buscarPorId(solicitudId);
  if (!solicitud) throw new SolicitudAuditoriaNoEncontradaError();
  if (
    solicitud.estadoVerificacion !== EstadoVerificacionSolicitud.EN_REVISION ||
    solicitud.auditorActualId !== auditorId
  ) {
    throw new ConflictoAuditoriaError(
      "Solo puedes gestionar evidencia mientras la solicitud esté en tu revisión.",
    );
  }
  return solicitud;
}
