import { prisma } from "@/lib/prisma";
import type {
  Ayuda,
  CambiosAyuda,
  MetaRecurso,
  NuevaAyuda,
  NuevaMeta,
} from "@/modules/ayudas/domain/Ayuda";
import type { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import type { TipoActividad } from "@/modules/ayudas/domain/TipoActividad";
import type {
  AyudaRepository,
  FiltroAyudas,
} from "@/modules/ayudas/domain/AyudaRepository";

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

// Implementación del repositorio sobre Prisma. Los enums de dominio y los de Prisma
// comparten los mismos valores (misma unión de strings), así que `estado` es
// asignable sin conversiones.
export class PrismaAyudaRepository implements AyudaRepository {
  async crear(datos: NuevaAyuda): Promise<Ayuda> {
    const fila = await prisma.ayuda.create({
      data: {
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

  async cambiarEstado(id: string, estado: EstadoAyuda): Promise<Ayuda> {
    const fila = await prisma.ayuda.update({
      where: { id },
      data: { estado },
      include: INCLUDE_METAS,
    });
    return mapearAyuda(fila);
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
