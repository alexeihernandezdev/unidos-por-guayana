import { prisma } from "@/lib/prisma";
import type {
  Actividad,
  CambiosActividad,
  MetaRecurso,
  NuevaActividad,
  NuevaMeta,
  PuntoAcopioDeActividad,
} from "@/modules/actividades/domain/Actividad";
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
    include: { recurso: true },
    orderBy: { recurso: { nombre: "asc" } },
  },
  puntosAcopio: {
    include: { puntoAcopio: true },
    orderBy: { puntoAcopio: { nombre: "asc" } },
  },
} as const;

// Fila de Prisma tal como la devuelve el `include` de arriba. Se tipa de forma
// estructural para mapearla a la entidad de dominio sin acoplarse a los tipos
// generados (que evolucionan con el schema).
type FilaMeta = {
  id: string;
  recursoId: string;
  cantidadObjetivo: { toNumber: () => number };
  recurso: { id: string; nombre: string; unidad: string } | null;
};

type FilaPuntoAsignado = {
  puntoAcopio: {
    id: string;
    nombre: string;
    referencia: string;
    horarios: string;
  };
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
        ...(filtro?.estado ? { estado: filtro.estado } : {}),
        ...(filtro?.tipo ? { tipo: filtro.tipo } : {}),
        ...(filtro?.adminId ? { adminId: filtro.adminId } : {}),
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
