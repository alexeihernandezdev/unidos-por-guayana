import { prisma } from "@/lib/prisma";
import type {
  CambiosSolicitud,
  NuevaSolicitud,
  NuevoRecursoSolicitud,
  RecursoSolicitud,
  Solicitud,
} from "@/modules/solicitudes/domain/Solicitud";
import type { CerradaPor } from "@/modules/solicitudes/domain/CerradaPor";
import type { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import type {
  FiltroSolicitudes,
  SolicitudRepository,
} from "@/modules/solicitudes/domain/SolicitudRepository";

const INCLUDE_RECURSOS = {
  recursos: {
    include: {
      recurso: true,
      // Atención que cubre este recurso (feature 030), con la actividad destino para
      // el badge "Atendido por actividad X".
      atencion: { include: { metaRecurso: { include: { actividad: true } } } },
    },
    orderBy: { recurso: { nombre: "asc" } },
  },
} as const;

type FilaRecurso = {
  id: string;
  recursoId: string;
  cantidadEstimada: { toNumber: () => number } | null;
  recurso: { id: string; nombre: string; unidad: string } | null;
  atencion: {
    metaRecurso: { actividad: { id: string; titulo: string } };
  } | null;
};

type FilaSolicitud = {
  id: string;
  sector: string;
  urgencia: Solicitud["urgencia"];
  descripcion: string;
  estado: EstadoSolicitud;
  cerradaPor: CerradaPor | null;
  solicitanteId: string;
  recursos: FilaRecurso[];
  createdAt: Date;
  updatedAt: Date;
};

function mapearRecurso(fila: FilaRecurso): RecursoSolicitud {
  return {
    id: fila.id,
    recursoId: fila.recursoId,
    cantidadEstimada: fila.cantidadEstimada
      ? fila.cantidadEstimada.toNumber()
      : null,
    recurso: fila.recurso
      ? {
          id: fila.recurso.id,
          nombre: fila.recurso.nombre,
          unidad: fila.recurso.unidad,
        }
      : null,
    atencion: fila.atencion
      ? {
          actividadId: fila.atencion.metaRecurso.actividad.id,
          actividadTitulo: fila.atencion.metaRecurso.actividad.titulo,
        }
      : null,
  };
}

function mapearSolicitud(fila: FilaSolicitud): Solicitud {
  return {
    id: fila.id,
    sector: fila.sector,
    urgencia: fila.urgencia,
    descripcion: fila.descripcion,
    estado: fila.estado,
    cerradaPor: fila.cerradaPor,
    solicitanteId: fila.solicitanteId,
    recursos: fila.recursos.map(mapearRecurso),
    createdAt: fila.createdAt,
    updatedAt: fila.updatedAt,
  };
}

export class PrismaSolicitudRepository implements SolicitudRepository {
  async crear(datos: NuevaSolicitud): Promise<Solicitud> {
    const fila = await prisma.solicitud.create({
      data: {
        sector: datos.sector,
        urgencia: datos.urgencia,
        descripcion: datos.descripcion,
        solicitanteId: datos.solicitanteId,
        recursos: {
          create: datos.recursos.map((r) => ({
            recursoId: r.recursoId,
            cantidadEstimada: r.cantidadEstimada ?? undefined,
          })),
        },
      },
      include: INCLUDE_RECURSOS,
    });
    return mapearSolicitud(fila);
  }

  async buscarPorId(id: string): Promise<Solicitud | null> {
    const fila = await prisma.solicitud.findUnique({
      where: { id },
      include: INCLUDE_RECURSOS,
    });
    return fila ? mapearSolicitud(fila) : null;
  }

  async listarDeSolicitante(solicitanteId: string): Promise<Solicitud[]> {
    const filas = await prisma.solicitud.findMany({
      where: { solicitanteId },
      orderBy: { createdAt: "desc" },
      include: INCLUDE_RECURSOS,
    });
    return filas.map(mapearSolicitud);
  }

  async listar(filtro?: FiltroSolicitudes): Promise<Solicitud[]> {
    const filas = await prisma.solicitud.findMany({
      where: {
        ...(filtro?.sector ? { sector: filtro.sector } : {}),
        ...(filtro?.urgencia ? { urgencia: filtro.urgencia } : {}),
        ...(filtro?.estado ? { estado: filtro.estado } : {}),
        ...(filtro?.solicitanteId
          ? { solicitanteId: filtro.solicitanteId }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: INCLUDE_RECURSOS,
    });
    return filas.map(mapearSolicitud);
  }

  async actualizarCabecera(
    id: string,
    cambios: CambiosSolicitud,
  ): Promise<Solicitud> {
    const fila = await prisma.solicitud.update({
      where: { id },
      data: cambios,
      include: INCLUDE_RECURSOS,
    });
    return mapearSolicitud(fila);
  }

  async reemplazarRecursos(
    solicitudId: string,
    recursos: NuevoRecursoSolicitud[],
  ): Promise<Solicitud> {
    await prisma.$transaction([
      prisma.recursoSolicitud.deleteMany({ where: { solicitudId } }),
      prisma.recursoSolicitud.createMany({
        data: recursos.map((r) => ({
          solicitudId,
          recursoId: r.recursoId,
          cantidadEstimada: r.cantidadEstimada ?? undefined,
        })),
      }),
    ]);
    return this.requerir(solicitudId);
  }

  async cambiarEstado(
    id: string,
    nuevoEstado: EstadoSolicitud,
    cerradaPor?: CerradaPor | null,
  ): Promise<Solicitud> {
    const fila = await prisma.solicitud.update({
      where: { id },
      data: {
        estado: nuevoEstado,
        ...(cerradaPor !== undefined ? { cerradaPor } : {}),
      },
      include: INCLUDE_RECURSOS,
    });
    return mapearSolicitud(fila);
  }

  private async requerir(id: string): Promise<Solicitud> {
    const solicitud = await this.buscarPorId(id);
    if (!solicitud) {
      throw new Error(`La solicitud "${id}" no existe.`);
    }
    return solicitud;
  }
}
