import {
  emitirDictamenAuditoria,
  liberarSolicitudAuditoria,
  listarSolicitudesAuditoria,
  obtenerSolicitudAuditoria,
  reenviarSolicitudAuditoria,
  tomarSolicitudAuditoria,
  type ActorAuditoria,
  type EmitirDictamenInput,
} from "@/modules/auditoria/application";
import type { FiltrosAuditoria } from "@/modules/auditoria/domain";
import type { AuditoriaVisible } from "@/modules/auditoria/domain";
import { PrismaAuditoriaRepository } from "@/modules/auditoria/infrastructure";

const auditorias = new PrismaAuditoriaRepository();

export const listarAuditoriaServicio = (
  actor: ActorAuditoria,
  filtros?: FiltrosAuditoria,
) => listarSolicitudesAuditoria(auditorias, actor, filtros);

export const obtenerAuditoriaServicio = (
  actor: ActorAuditoria,
  solicitudId: string,
) => obtenerSolicitudAuditoria(auditorias, actor, solicitudId);

export const tomarAuditoriaServicio = (
  actor: ActorAuditoria,
  solicitudId: string,
) => tomarSolicitudAuditoria(auditorias, actor, solicitudId);

export const liberarAuditoriaServicio = (
  actor: ActorAuditoria,
  solicitudId: string,
) => liberarSolicitudAuditoria(auditorias, actor, solicitudId);

export const dictaminarAuditoriaServicio = (
  actor: ActorAuditoria,
  solicitudId: string,
  input: EmitirDictamenInput,
) => emitirDictamenAuditoria(auditorias, actor, solicitudId, input);

export const reenviarAuditoriaServicio = (
  solicitudId: string,
  solicitanteId: string,
) => reenviarSolicitudAuditoria(auditorias, solicitudId, solicitanteId);

export const buscarAuditoriaPorSolicitudServicio = (solicitudId: string) =>
  auditorias.buscarPorId(solicitudId);

export const liberarAsignacionesAuditorServicio = (
  auditorId: string,
  actorId: string,
) => auditorias.liberarAsignaciones(auditorId, actorId);

function visible(
  solicitud: Awaited<ReturnType<typeof auditorias.buscarPorId>>,
  mostrarRespaldo: boolean,
): AuditoriaVisible | null {
  if (!solicitud) return null;
  return {
    estado: solicitud.estadoVerificacion,
    ciclo: solicitud.cicloAuditoria,
    eventos: solicitud.eventos.map((evento) => ({
      id: evento.id,
      tipo: evento.tipo,
      estadoResultante: evento.estadoResultante,
      ciclo: evento.ciclo,
      actorNombre: evento.actorNombre,
      metodo: mostrarRespaldo ? evento.metodo : null,
      explicacionPublica: evento.explicacionPublica,
      referenciaExterna: mostrarRespaldo ? evento.referenciaExterna : null,
      createdAt: evento.createdAt,
    })),
  };
}

export async function obtenerAuditoriaSolicitanteServicio(
  solicitudId: string,
  solicitanteId: string,
): Promise<AuditoriaVisible | null> {
  const solicitud = await auditorias.buscarPorId(solicitudId);
  if (!solicitud || solicitud.solicitante.id !== solicitanteId) return null;
  return visible(solicitud, false);
}

export async function obtenerAuditoriaAdministracionServicio(
  solicitudId: string,
): Promise<AuditoriaVisible | null> {
  return visible(await auditorias.buscarPorId(solicitudId), true);
}
