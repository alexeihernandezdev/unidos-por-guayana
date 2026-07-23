import { prisma } from "@/lib/prisma";
import type {
  Actividad,
  CambiosActividad,
  MetaRecurso,
  NuevaActividad,
  NuevaMeta,
  PuntoAcopioDeActividad,
} from "@/modules/actividades/domain/Actividad";
import type {
  ArchivoActividad,
  NuevoArchivoActividad,
  TipoArchivoActividad,
} from "@/modules/actividades/domain/ArchivoActividad";
import type { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import type { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import type {
  ActividadRepository,
  FiltroActividades,
} from "@/modules/actividades/domain/ActividadRepository";

// Se incluyen las metas con su recurso (para nombre/unidad) y los puntos de acopio
// asignados con su punto (para el bloque "Dónde entregar", feature 026). Ordenados
// por nombre para una lectura estable.
const INCLUDE_DETALLE = {
  metas: {
    include: {
      recurso: true,
      // Necesidades de solicitud que atiende cada meta (feature 030), con datos planos
      // de la solicitud/solicitante para listarlas dentro de la meta en edición.
      atenciones: {
        include: {
          recursoSolicitud: {
            include: { solicitud: { include: { solicitante: true } } },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { recurso: { nombre: "asc" } },
  },
  puntosAcopio: {
    include: { puntoAcopio: true },
    orderBy: { puntoAcopio: { nombre: "asc" } },
  },
  // Imagen principal y adjuntos de la actividad (feature 033).
  archivos: {
    orderBy: { createdAt: "asc" },
  },
} as const;

// Fila de Prisma tal como la devuelve el `include` de arriba. Se tipa de forma
// estructural para mapearla a la entidad de dominio sin acoplarse a los tipos
// generados (que evolucionan con el schema).
type FilaAtencion = {
  id: string;
  recursoSolicitudId: string;
  recursoSolicitud: {
    solicitudId: string;
    cantidadEstimada: { toNumber: () => number } | null;
    solicitud: { sector: string; solicitante: { nombre: string } };
  };
};

type FilaMeta = {
  id: string;
  recursoId: string;
  cantidadObjetivo: { toNumber: () => number };
  recurso: { id: string; nombre: string; unidad: string } | null;
  atenciones: FilaAtencion[];
};

type FilaPuntoAsignado = {
  puntoAcopio: {
    id: string;
    nombre: string;
    referencia: string;
    horarios: string;
  };
};

type FilaArchivo = {
  id: string;
  tipo: TipoArchivoActividad;
  path: string;
  nombreOriginal: string;
  contentType: string;
  tamanoBytes: number;
  createdAt: Date;
};

type FilaActividad = {
  id: string;
  adminId: string;
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  horaFin: Date | null;
  estado: EstadoActividad;
  tipo: TipoActividad;
  descripcion: string | null;
  puntosAcopio: FilaPuntoAsignado[];
  metas: FilaMeta[];
  archivos: FilaArchivo[];
  createdAt: Date;
  updatedAt: Date;
};

function mapearPunto(fila: FilaPuntoAsignado): PuntoAcopioDeActividad {
  return {
    id: fila.puntoAcopio.id,
    nombre: fila.puntoAcopio.nombre,
    referencia: fila.puntoAcopio.referencia,
    horarios: fila.puntoAcopio.horarios,
  };
}

function mapearArchivo(fila: FilaArchivo): ArchivoActividad {
  return {
    id: fila.id,
    tipo: fila.tipo,
    path: fila.path,
    nombreOriginal: fila.nombreOriginal,
    contentType: fila.contentType,
    tamanoBytes: fila.tamanoBytes,
    createdAt: fila.createdAt,
  };
}

// Convierte el `Decimal` de Prisma a `number`: el dominio trabaja con números puros
// (ver decisión en spec/plan de la feature 005).
function mapearMeta(fila: FilaMeta): MetaRecurso {
  return {
    id: fila.id,
    recursoId: fila.recursoId,
    cantidadObjetivo: fila.cantidadObjetivo.toNumber(),
    recurso: fila.recurso
      ? {
          id: fila.recurso.id,
          nombre: fila.recurso.nombre,
          unidad: fila.recurso.unidad,
        }
      : null,
    atenciones: fila.atenciones.map((a) => ({
      atencionId: a.id,
      recursoSolicitudId: a.recursoSolicitudId,
      solicitudId: a.recursoSolicitud.solicitudId,
      sector: a.recursoSolicitud.solicitud.sector,
      solicitanteNombre: a.recursoSolicitud.solicitud.solicitante.nombre,
      cantidadEstimada: a.recursoSolicitud.cantidadEstimada
        ? a.recursoSolicitud.cantidadEstimada.toNumber()
        : null,
    })),
  };
}

function mapearActividad(fila: FilaActividad): Actividad {
  return {
    id: fila.id,
    adminId: fila.adminId,
    titulo: fila.titulo,
    sectorDestino: fila.sectorDestino,
    fecha: fila.fecha,
    horaFin: fila.horaFin,
    estado: fila.estado,
    tipo: fila.tipo,
    descripcion: fila.descripcion,
    puntosAcopio: fila.puntosAcopio.map(mapearPunto),
    metas: fila.metas.map(mapearMeta),
    archivos: fila.archivos.map(mapearArchivo),
    createdAt: fila.createdAt,
    updatedAt: fila.updatedAt,
  };
}

// Implementación del repositorio sobre Prisma. Los enums de dominio y los de Prisma
// comparten los mismos valores (misma unión de strings), así que `estado` es
// asignable sin conversiones.
export class PrismaActividadRepository implements ActividadRepository {
  async crear(datos: NuevaActividad): Promise<Actividad> {
    const fila = await prisma.actividad.create({
      data: {
        adminId: datos.adminId,
        titulo: datos.titulo,
        sectorDestino: datos.sectorDestino,
        fecha: datos.fecha,
        horaFin: datos.horaFin,
        tipo: datos.tipo,
        descripcion: datos.descripcion,
        puntosAcopio: {
          create: datos.puntosAcopioIds.map((puntoAcopioId) => ({
            puntoAcopioId,
          })),
        },
        metas: {
          create: datos.metas.map((m) => ({
            recursoId: m.recursoId,
            cantidadObjetivo: m.cantidadObjetivo,
          })),
        },
      },
      include: INCLUDE_DETALLE,
    });
    return mapearActividad(fila);
  }

  async listar(filtro?: FiltroActividades): Promise<Actividad[]> {
    const filas = await prisma.actividad.findMany({
      where: {
        ...(filtro?.texto
          ? {
              OR: [
                {
                  titulo: { contains: filtro.texto, mode: "insensitive" as const },
                },
                {
                  descripcion: {
                    contains: filtro.texto,
                    mode: "insensitive" as const,
                  },
                },
                {
                  sectorDestino: {
                    contains: filtro.texto,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
        ...(filtro?.estado ? { estado: filtro.estado } : {}),
        ...(filtro?.tipo ? { tipo: filtro.tipo } : {}),
        ...(filtro?.adminId ? { adminId: filtro.adminId } : {}),
        ...(filtro?.puntoAcopioId
          ? { puntosAcopio: { some: { puntoAcopioId: filtro.puntoAcopioId } } }
          : {}),
        ...(filtro?.fechaDesde || filtro?.fechaHasta
          ? {
              fecha: {
                ...(filtro.fechaDesde ? { gte: filtro.fechaDesde } : {}),
                ...(filtro.fechaHasta ? { lte: filtro.fechaHasta } : {}),
              },
            }
          : {}),
      },
      orderBy: { fecha: "desc" },
      include: INCLUDE_DETALLE,
    });
    return filas.map(mapearActividad);
  }

  async buscarPorId(id: string): Promise<Actividad | null> {
    const fila = await prisma.actividad.findUnique({
      where: { id },
      include: INCLUDE_DETALLE,
    });
    return fila ? mapearActividad(fila) : null;
  }

  async actualizarCabecera(id: string, cambios: CambiosActividad): Promise<Actividad> {
    // `puntosAcopioIds` no es un campo escalar: cuando viene, reemplaza el conjunto
    // de la tabla puente (borra las filas actuales y crea las nuevas, feature 026).
    const { puntosAcopioIds, ...escalares } = cambios;
    const fila = await prisma.actividad.update({
      where: { id },
      data: {
        ...escalares,
        ...(puntosAcopioIds !== undefined
          ? {
              puntosAcopio: {
                deleteMany: {},
                create: puntosAcopioIds.map((puntoAcopioId) => ({
                  puntoAcopioId,
                })),
              },
            }
          : {}),
      },
      include: INCLUDE_DETALLE,
    });
    return mapearActividad(fila);
  }

  async upsertMeta(actividadId: string, meta: NuevaMeta): Promise<Actividad> {
    await prisma.metaRecurso.upsert({
      where: {
        actividadId_recursoId: { actividadId, recursoId: meta.recursoId },
      },
      create: {
        actividadId,
        recursoId: meta.recursoId,
        cantidadObjetivo: meta.cantidadObjetivo,
      },
      update: { cantidadObjetivo: meta.cantidadObjetivo },
    });
    return this.requerir(actividadId);
  }

  async quitarMeta(actividadId: string, recursoId: string): Promise<Actividad> {
    await prisma.metaRecurso.deleteMany({ where: { actividadId, recursoId } });
    return this.requerir(actividadId);
  }

  async cambiarEstado(id: string, estado: EstadoActividad): Promise<Actividad> {
    const fila = await prisma.actividad.update({
      where: { id },
      data: { estado },
      include: INCLUDE_DETALLE,
    });
    return mapearActividad(fila);
  }

  async eliminar(id: string): Promise<void> {
    await prisma.actividad.delete({ where: { id } });
  }

  // ── Archivos (feature 033) ──

  async crearArchivo(nuevo: NuevoArchivoActividad): Promise<ArchivoActividad> {
    const fila = await prisma.archivoActividad.create({
      data: {
        actividadId: nuevo.actividadId,
        tipo: nuevo.tipo,
        path: nuevo.path,
        nombreOriginal: nuevo.nombreOriginal,
        contentType: nuevo.contentType,
        tamanoBytes: nuevo.tamanoBytes,
      },
    });
    return mapearArchivo(fila);
  }

  async eliminarArchivo(archivoId: string): Promise<void> {
    await prisma.archivoActividad.delete({ where: { id: archivoId } });
  }

  async buscarArchivoPorId(
    archivoId: string,
  ): Promise<{ archivo: ArchivoActividad; actividadId: string } | null> {
    const fila = await prisma.archivoActividad.findUnique({
      where: { id: archivoId },
    });
    if (!fila) return null;
    return { archivo: mapearArchivo(fila), actividadId: fila.actividadId };
  }

  async contarAdjuntos(actividadId: string): Promise<number> {
    return prisma.archivoActividad.count({
      where: { actividadId, tipo: "ADJUNTO" },
    });
  }

  async obtenerArchivoPrincipal(
    actividadId: string,
  ): Promise<ArchivoActividad | null> {
    const fila = await prisma.archivoActividad.findFirst({
      where: { actividadId, tipo: "PRINCIPAL" },
    });
    return fila ? mapearArchivo(fila) : null;
  }

  // Relee la Actividad tras modificar sus metas. Si desapareció entre operaciones,
  // Prisma habría fallado antes; aquí devolvemos el estado ya consistente.
  private async requerir(id: string): Promise<Actividad> {
    const actividad = await this.buscarPorId(id);
    if (!actividad) {
      throw new Error(`La actividad "${id}" no existe.`);
    }
    return actividad;
  }
}
