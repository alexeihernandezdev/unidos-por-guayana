import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  EstadoVerificacionSolicitud,
  TipoEventoAuditoriaSolicitud,
  type ArchivoEvidenciaAuditoria,
  type AuditoriaRepository,
  type DictamenAuditoria,
  type EvidenciaAuditoriaRepository,
  type FiltrosAuditoria,
  type NuevaEvidenciaAuditoria,
  type SolicitudAuditable,
} from "@/modules/auditoria/domain";

const INCLUDE_AUDITORIA = {
  solicitante: {
    select: { id: true, nombre: true, email: true, telefono: true },
  },
  auditorActual: { select: { id: true, nombre: true } },
  recursos: {
    include: { recurso: { select: { nombre: true, unidad: true } } },
    orderBy: { recurso: { nombre: "asc" } },
  },
  eventosAuditoria: {
    include: { actor: { select: { nombre: true } } },
    orderBy: { createdAt: "desc" },
  },
} as const;

type FilaAuditable = Prisma.SolicitudGetPayload<{
  include: typeof INCLUDE_AUDITORIA;
}>;

function mapear(fila: FilaAuditable): SolicitudAuditable {
  return {
    id: fila.id,
    sector: fila.sector,
    descripcion: fila.descripcion,
    urgencia: fila.urgencia,
    estadoVerificacion: fila.estadoVerificacion,
    auditorActualId: fila.auditorActualId,
    auditorActualNombre: fila.auditorActual?.nombre ?? null,
    cicloAuditoria: fila.cicloAuditoria,
    solicitante: fila.solicitante,
    recursos: fila.recursos.map((item) => ({
      id: item.id,
      nombre: item.recurso.nombre,
      unidad: item.recurso.unidad,
      cantidadEstimada: item.cantidadEstimada?.toNumber() ?? null,
    })),
    eventos: fila.eventosAuditoria.map((evento) => ({
      id: evento.id,
      actorId: evento.actorId,
      actorNombre: evento.actor.nombre,
      tipo: evento.tipo,
      estadoResultante: evento.estadoResultante,
      ciclo: evento.ciclo,
      metodo: evento.metodo,
      notaInterna: evento.notaInterna,
      explicacionPublica: evento.explicacionPublica,
      referenciaExterna: evento.referenciaExterna,
      createdAt: evento.createdAt,
    })),
    createdAt: fila.createdAt,
    updatedAt: fila.updatedAt,
  };
}

const INCLUDE_EVIDENCIA = {
  subidoPor: { select: { nombre: true } },
} as const;

type FilaEvidencia = Prisma.ArchivoEvidenciaAuditoriaGetPayload<{
  include: typeof INCLUDE_EVIDENCIA;
}>;

function mapearEvidencia(fila: FilaEvidencia): ArchivoEvidenciaAuditoria {
  return {
    id: fila.id,
    solicitudId: fila.solicitudId,
    subidoPorId: fila.subidoPorId,
    subidoPorNombre: fila.subidoPor?.nombre ?? null,
    ciclo: fila.ciclo,
    path: fila.path,
    nombreOriginal: fila.nombreOriginal,
    contentType: fila.contentType,
    tamanoBytes: fila.tamanoBytes,
    createdAt: fila.createdAt,
  };
}

export class PrismaAuditoriaRepository
  implements AuditoriaRepository, EvidenciaAuditoriaRepository
{
  async listar(filtros?: FiltrosAuditoria): Promise<SolicitudAuditable[]> {
    const texto = filtros?.texto?.trim();
    const filas = await prisma.solicitud.findMany({
      where: {
        estado: "ABIERTA",
        ...(filtros?.estado
          ? { estadoVerificacion: filtros.estado }
          : {}),
        ...(filtros?.urgencia ? { urgencia: filtros.urgencia } : {}),
        ...(filtros?.auditorId
          ? { auditorActualId: filtros.auditorId }
          : {}),
        ...(texto
          ? {
              OR: [
                { sector: { contains: texto, mode: "insensitive" as const } },
                {
                  descripcion: {
                    contains: texto,
                    mode: "insensitive" as const,
                  },
                },
                {
                  solicitante: {
                    nombre: { contains: texto, mode: "insensitive" as const },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ urgencia: "desc" }, { createdAt: "asc" }],
      include: INCLUDE_AUDITORIA,
    });
    return filas.map(mapear);
  }

  async buscarPorId(id: string): Promise<SolicitudAuditable | null> {
    const fila = await prisma.solicitud.findUnique({
      where: { id },
      include: INCLUDE_AUDITORIA,
    });
    return fila ? mapear(fila) : null;
  }

  async tomar(solicitudId: string, auditorId: string): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const actualizada = await tx.solicitud.updateMany({
        where: {
          id: solicitudId,
          estadoVerificacion: EstadoVerificacionSolicitud.PENDIENTE,
          auditorActualId: null,
          estado: "ABIERTA",
        },
        data: {
          estadoVerificacion: EstadoVerificacionSolicitud.EN_REVISION,
          auditorActualId: auditorId,
          estado: "ABIERTA",
        },
      });
      if (actualizada.count !== 1) return false;

      const solicitud = await tx.solicitud.findUniqueOrThrow({
        where: { id: solicitudId },
        select: { cicloAuditoria: true },
      });
      await tx.eventoAuditoriaSolicitud.create({
        data: {
          solicitudId,
          actorId: auditorId,
          tipo: TipoEventoAuditoriaSolicitud.TOMADA,
          estadoResultante: EstadoVerificacionSolicitud.EN_REVISION,
          ciclo: solicitud.cicloAuditoria,
        },
      });
      return true;
    });
  }

  async liberar(solicitudId: string, auditorId: string): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const solicitud = await tx.solicitud.findFirst({
        where: {
          id: solicitudId,
          estadoVerificacion: EstadoVerificacionSolicitud.EN_REVISION,
          auditorActualId: auditorId,
          estado: "ABIERTA",
        },
        select: { cicloAuditoria: true },
      });
      if (!solicitud) return false;

      const actualizada = await tx.solicitud.updateMany({
        where: {
          id: solicitudId,
          estadoVerificacion: EstadoVerificacionSolicitud.EN_REVISION,
          auditorActualId: auditorId,
        },
        data: {
          estadoVerificacion: EstadoVerificacionSolicitud.PENDIENTE,
          auditorActualId: null,
        },
      });
      if (actualizada.count !== 1) return false;

      await tx.eventoAuditoriaSolicitud.create({
        data: {
          solicitudId,
          actorId: auditorId,
          tipo: TipoEventoAuditoriaSolicitud.LIBERADA,
          estadoResultante: EstadoVerificacionSolicitud.PENDIENTE,
          ciclo: solicitud.cicloAuditoria,
        },
      });
      return true;
    });
  }

  async dictaminar(input: DictamenAuditoria): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const solicitud = await tx.solicitud.findFirst({
        where: {
          id: input.solicitudId,
          estadoVerificacion: EstadoVerificacionSolicitud.EN_REVISION,
          auditorActualId: input.auditorId,
          estado: "ABIERTA",
        },
        select: { cicloAuditoria: true },
      });
      if (!solicitud) return false;

      const actualizada = await tx.solicitud.updateMany({
        where: {
          id: input.solicitudId,
          estadoVerificacion: EstadoVerificacionSolicitud.EN_REVISION,
          auditorActualId: input.auditorId,
          estado: "ABIERTA",
        },
        data: {
          estadoVerificacion: input.resultado,
          auditorActualId: null,
        },
      });
      if (actualizada.count !== 1) return false;

      await tx.eventoAuditoriaSolicitud.create({
        data: {
          solicitudId: input.solicitudId,
          actorId: input.auditorId,
          tipo: TipoEventoAuditoriaSolicitud.DICTAMEN,
          estadoResultante: input.resultado,
          ciclo: solicitud.cicloAuditoria,
          metodo: input.metodo,
          notaInterna: input.notaInterna,
          explicacionPublica: input.explicacionPublica,
          referenciaExterna: input.referenciaExterna,
        },
      });
      return true;
    });
  }

  async reenviar(
    solicitudId: string,
    solicitanteId: string,
  ): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const solicitud = await tx.solicitud.findFirst({
        where: {
          id: solicitudId,
          solicitanteId,
          estado: "ABIERTA",
          estadoVerificacion:
            EstadoVerificacionSolicitud.REQUIERE_INFORMACION,
        },
        select: { cicloAuditoria: true },
      });
      if (!solicitud) return false;

      const nuevoCiclo = solicitud.cicloAuditoria + 1;
      const actualizada = await tx.solicitud.updateMany({
        where: {
          id: solicitudId,
          solicitanteId,
          estado: "ABIERTA",
          estadoVerificacion:
            EstadoVerificacionSolicitud.REQUIERE_INFORMACION,
          cicloAuditoria: solicitud.cicloAuditoria,
        },
        data: {
          estadoVerificacion: EstadoVerificacionSolicitud.PENDIENTE,
          auditorActualId: null,
          cicloAuditoria: nuevoCiclo,
        },
      });
      if (actualizada.count !== 1) return false;

      await tx.eventoAuditoriaSolicitud.create({
        data: {
          solicitudId,
          actorId: solicitanteId,
          tipo: TipoEventoAuditoriaSolicitud.REENVIADA,
          estadoResultante: EstadoVerificacionSolicitud.PENDIENTE,
          ciclo: nuevoCiclo,
        },
      });
      return true;
    });
  }

  async liberarAsignaciones(
    auditorId: string,
    actorId: string,
  ): Promise<number> {
    return prisma.$transaction(async (tx) => {
      const liberadas = await tx.solicitud.updateManyAndReturn({
        where: {
          auditorActualId: auditorId,
          estado: "ABIERTA",
          estadoVerificacion: EstadoVerificacionSolicitud.EN_REVISION,
        },
        data: {
          auditorActualId: null,
          estadoVerificacion: EstadoVerificacionSolicitud.PENDIENTE,
        },
        select: { id: true, cicloAuditoria: true },
      });
      if (liberadas.length > 0) {
        await tx.eventoAuditoriaSolicitud.createMany({
          data: liberadas.map((solicitud) => ({
            solicitudId: solicitud.id,
            actorId,
            tipo: TipoEventoAuditoriaSolicitud.LIBERADA,
            estadoResultante: EstadoVerificacionSolicitud.PENDIENTE,
            ciclo: solicitud.cicloAuditoria,
          })),
        });
      }
      return liberadas.length;
    });
  }

  // ── Evidencia de verificación (feature 032) ──

  async crearEvidencia(
    input: NuevaEvidenciaAuditoria,
  ): Promise<ArchivoEvidenciaAuditoria> {
    const fila = await prisma.archivoEvidenciaAuditoria.create({
      data: {
        solicitudId: input.solicitudId,
        subidoPorId: input.subidoPorId,
        ciclo: input.ciclo,
        path: input.path,
        nombreOriginal: input.nombreOriginal,
        contentType: input.contentType,
        tamanoBytes: input.tamanoBytes,
      },
      include: INCLUDE_EVIDENCIA,
    });
    return mapearEvidencia(fila);
  }

  async listarEvidencias(
    solicitudId: string,
  ): Promise<ArchivoEvidenciaAuditoria[]> {
    const filas = await prisma.archivoEvidenciaAuditoria.findMany({
      where: { solicitudId },
      orderBy: { createdAt: "asc" },
      include: INCLUDE_EVIDENCIA,
    });
    return filas.map(mapearEvidencia);
  }

  async buscarEvidenciaPorId(
    id: string,
  ): Promise<ArchivoEvidenciaAuditoria | null> {
    const fila = await prisma.archivoEvidenciaAuditoria.findUnique({
      where: { id },
      include: INCLUDE_EVIDENCIA,
    });
    return fila ? mapearEvidencia(fila) : null;
  }

  async eliminarEvidencia(id: string): Promise<void> {
    await prisma.archivoEvidenciaAuditoria.delete({ where: { id } });
  }

  async contarEvidencias(solicitudId: string): Promise<number> {
    return prisma.archivoEvidenciaAuditoria.count({ where: { solicitudId } });
  }
}
