import {
  confirmarEvidencia,
  eliminarEvidencia,
  emitirDictamenAuditoria,
  liberarSolicitudAuditoria,
  listarSolicitudesAuditoria,
  obtenerSolicitudAuditoria,
  prepararSubidaEvidencia,
  reenviarSolicitudAuditoria,
  tomarSolicitudAuditoria,
  urlsEvidenciaDeSolicitud,
  type ActorAuditoria,
  type ConfirmarEvidenciaInput,
  type EmitirDictamenInput,
  type EvidenciaAuditoriaDeps,
  type PrepararSubidaEvidenciaInput,
  type PreparacionSubidaEvidencia,
} from "@/modules/auditoria/application";
import type {
  ArchivoEvidenciaAuditoria,
  AuditoriaVisible,
  FiltrosAuditoria,
} from "@/modules/auditoria/domain";
import { PrismaAuditoriaRepository } from "@/modules/auditoria/infrastructure";
import { SupabaseStorageAdapter } from "@/modules/archivos/infrastructure/SupabaseStorageAdapter";

const auditorias = new PrismaAuditoriaRepository();
const storage = new SupabaseStorageAdapter();
// La misma instancia Prisma implementa `AuditoriaRepository` y `EvidenciaAuditoriaRepository`.
const evidenciaDeps: EvidenciaAuditoriaDeps = {
  auditorias,
  evidencias: auditorias,
  storage,
};

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

// ── Evidencia de verificación (feature 032) ──

export const prepararSubidaEvidenciaServicio = (
  actor: ActorAuditoria,
  input: PrepararSubidaEvidenciaInput,
): Promise<PreparacionSubidaEvidencia> =>
  prepararSubidaEvidencia(evidenciaDeps, input, actor);

export const confirmarEvidenciaServicio = (
  actor: ActorAuditoria,
  input: ConfirmarEvidenciaInput,
): Promise<ArchivoEvidenciaAuditoria> =>
  confirmarEvidencia(evidenciaDeps, input, actor);

export const eliminarEvidenciaServicio = (
  actor: ActorAuditoria,
  evidenciaId: string,
  solicitudId: string,
): Promise<void> =>
  eliminarEvidencia(evidenciaDeps, evidenciaId, solicitudId, actor);

// Vista de evidencia para los detalles (auditor y admin): incluye el enlace firmado si
// el almacenamiento está disponible, y degrada a metadatos sin enlace (`url: null`) si
// falla (p. ej. Supabase sin configurar en local), para no romper la página.
export type EvidenciaVista = {
  id: string;
  subidoPorNombre: string | null;
  ciclo: number;
  nombreOriginal: string;
  contentType: string;
  tamanoBytes: number;
  createdAt: Date;
  url: string | null;
};

function vistaEvidencia(
  e: ArchivoEvidenciaAuditoria,
  url: string | null,
): EvidenciaVista {
  return {
    id: e.id,
    subidoPorNombre: e.subidoPorNombre,
    ciclo: e.ciclo,
    nombreOriginal: e.nombreOriginal,
    contentType: e.contentType,
    tamanoBytes: e.tamanoBytes,
    createdAt: e.createdAt,
    url,
  };
}

export async function cargarEvidenciasVistaServicio(
  solicitudId: string,
): Promise<{ evidencias: EvidenciaVista[]; error: boolean }> {
  try {
    const conUrl = await urlsEvidenciaDeSolicitud(evidenciaDeps, solicitudId);
    return {
      evidencias: conUrl.map((e) => vistaEvidencia(e, e.url)),
      error: false,
    };
  } catch {
    const evidencias = await auditorias.listarEvidencias(solicitudId);
    return {
      evidencias: evidencias.map((e) => vistaEvidencia(e, null)),
      error: true,
    };
  }
}
