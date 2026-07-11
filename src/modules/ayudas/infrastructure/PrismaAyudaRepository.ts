import { prisma } from "@/lib/prisma";
import type {
  Ayuda,
  CambiosAyuda,
  MetaRecurso,
  NuevaAyuda,
  NuevaMeta,
} from "@/modules/ayudas/domain/Ayuda";
import { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import type { TipoActividad } from "@/modules/ayudas/domain/TipoActividad";
import type {
  AyudaRepository,
  FiltroAyudas,
} from "@/modules/ayudas/domain/AyudaRepository";
import type {
  NuevoEventoSeguimiento,
  SeguimientoEvento,
} from "@/modules/ayudas/domain/SeguimientoEvento";

// Se incluyen las metas con el recurso asociado para poder mostrar nombre/unidad en
// el detalle. Se ordenan por nombre del recurso para una lectura estable.
const INCLUDE_METAS = {
  metas: {
    include: { recurso: true },
    orderBy: { recurso: { nombre: "asc" } },
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

type FilaAyuda = {
  id: string;
  adminId: string;
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  estado: EstadoAyuda;
  tipo: TipoActividad;
  descripcion: string | null;
  metas: FilaMeta[];
  createdAt: Date;
  updatedAt: Date;
};

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

function mapearAyuda(fila: FilaAyuda): Ayuda {
  return {
    id: fila.id,
    adminId: fila.adminId,
    titulo: fila.titulo,
    sectorDestino: fila.sectorDestino,
    fecha: fila.fecha,
    estado: fila.estado,
    tipo: fila.tipo,
    descripcion: fila.descripcion,
    metas: fila.metas.map(mapearMeta),
    createdAt: fila.createdAt,
    updatedAt: fila.updatedAt,
  };
}

// Fila del evento de seguimiento (feature 010). Los enums de dominio y de Prisma
// comparten valores, así que `estadoAnterior`/`estadoNuevo` se asignan sin casts.
type FilaEvento = {
  id: string;
  ayudaId: string;
  estadoAnterior: EstadoAyuda | null;
  estadoNuevo: EstadoAyuda;
  nota: string | null;
  evidenciaUrl: string | null;
  ocurridoEn: Date;
  registradoPor: string | null;
};

function mapearEvento(fila: FilaEvento): SeguimientoEvento {
  return {
    id: fila.id,
    ayudaId: fila.ayudaId,
    estadoAnterior: fila.estadoAnterior,
    estadoNuevo: fila.estadoNuevo,
    nota: fila.nota,
    evidenciaUrl: fila.evidenciaUrl,
    ocurridoEn: fila.ocurridoEn,
    registradoPor: fila.registradoPor,
  };
}

// Implementación del repositorio sobre Prisma. Los enums de dominio y los de Prisma
// comparten los mismos valores (misma unión de strings), así que `estado` es
// asignable sin conversiones.
export class PrismaAyudaRepository implements AyudaRepository {
  async crear(datos: NuevaAyuda): Promise<Ayuda> {
    const fila = await prisma.ayuda.create({
      data: {
        adminId: datos.adminId,
        titulo: datos.titulo,
        sectorDestino: datos.sectorDestino,
        fecha: datos.fecha,
        tipo: datos.tipo,
        descripcion: datos.descripcion,
        metas: {
          create: datos.metas.map((m) => ({
            recursoId: m.recursoId,
            cantidadObjetivo: m.cantidadObjetivo,
          })),
        },
        // Evento de creación (origen de la línea de tiempo, feature 010),
        // atómico con el alta vía escritura anidada. `registradoPor` es el ADMIN
        // creador; nunca se expone en superficies públicas.
        seguimiento: {
          create: {
            estadoAnterior: null,
            estadoNuevo: EstadoAyuda.RECOLECTANDO,
            registradoPor: datos.adminId,
          },
        },
      },
      include: INCLUDE_METAS,
    });
    return mapearAyuda(fila);
  }

  async listar(filtro?: FiltroAyudas): Promise<Ayuda[]> {
    const filas = await prisma.ayuda.findMany({
      where: {
        ...(filtro?.estado ? { estado: filtro.estado } : {}),
        ...(filtro?.tipo ? { tipo: filtro.tipo } : {}),
        ...(filtro?.adminId ? { adminId: filtro.adminId } : {}),
      },
      orderBy: { fecha: "desc" },
      include: INCLUDE_METAS,
    });
    return filas.map(mapearAyuda);
  }

  async buscarPorId(id: string): Promise<Ayuda | null> {
    const fila = await prisma.ayuda.findUnique({
      where: { id },
      include: INCLUDE_METAS,
    });
    return fila ? mapearAyuda(fila) : null;
  }

  async actualizarCabecera(id: string, cambios: CambiosAyuda): Promise<Ayuda> {
    const fila = await prisma.ayuda.update({
      where: { id },
      data: cambios,
      include: INCLUDE_METAS,
    });
    return mapearAyuda(fila);
  }

  async upsertMeta(ayudaId: string, meta: NuevaMeta): Promise<Ayuda> {
    await prisma.metaRecurso.upsert({
      where: {
        ayudaId_recursoId: { ayudaId, recursoId: meta.recursoId },
      },
      create: {
        ayudaId,
        recursoId: meta.recursoId,
        cantidadObjetivo: meta.cantidadObjetivo,
      },
      update: { cantidadObjetivo: meta.cantidadObjetivo },
    });
    return this.requerir(ayudaId);
  }

  async quitarMeta(ayudaId: string, recursoId: string): Promise<Ayuda> {
    await prisma.metaRecurso.deleteMany({ where: { ayudaId, recursoId } });
    return this.requerir(ayudaId);
  }

  async avanzarConSeguimiento(
    id: string,
    nuevoEstado: EstadoAyuda,
    evento: NuevoEventoSeguimiento,
  ): Promise<Ayuda> {
    // Atómico: cambia el estado e inserta el evento en la misma transacción. Si
    // cualquiera falla, ninguna se aplica (nunca un estado sin su evento).
    const [fila] = await prisma.$transaction([
      prisma.ayuda.update({
        where: { id },
        data: { estado: nuevoEstado },
        include: INCLUDE_METAS,
      }),
      prisma.seguimientoEvento.create({
        data: {
          ayudaId: id,
          estadoAnterior: evento.estadoAnterior,
          estadoNuevo: evento.estadoNuevo,
          nota: evento.nota ?? null,
          evidenciaUrl: evento.evidenciaUrl ?? null,
          registradoPor: evento.registradoPor ?? null,
        },
      }),
    ]);
    return mapearAyuda(fila);
  }

  async registrarEvento(
    ayudaId: string,
    evento: NuevoEventoSeguimiento,
  ): Promise<SeguimientoEvento> {
    const fila = await prisma.seguimientoEvento.create({
      data: {
        ayudaId,
        estadoAnterior: evento.estadoAnterior,
        estadoNuevo: evento.estadoNuevo,
        nota: evento.nota ?? null,
        evidenciaUrl: evento.evidenciaUrl ?? null,
        registradoPor: evento.registradoPor ?? null,
      },
    });
    return mapearEvento(fila);
  }

  async listarSeguimiento(ayudaId: string): Promise<SeguimientoEvento[]> {
    const filas = await prisma.seguimientoEvento.findMany({
      where: { ayudaId },
      orderBy: { ocurridoEn: "asc" },
    });
    return filas.map(mapearEvento);
  }

  async eliminar(id: string): Promise<void> {
    await prisma.ayuda.delete({ where: { id } });
  }

  // Relee la Ayuda tras modificar sus metas. Si desapareció entre operaciones,
  // Prisma habría fallado antes; aquí devolvemos el estado ya consistente.
  private async requerir(id: string): Promise<Ayuda> {
    const ayuda = await this.buscarPorId(id);
    if (!ayuda) {
      throw new Error(`La ayuda "${id}" no existe.`);
    }
    return ayuda;
  }
}
