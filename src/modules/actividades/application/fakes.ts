import type {
  Actividad,
  CambiosActividad,
  MetaRecurso,
  NuevaActividad,
  NuevaMeta,
} from "@/modules/actividades/domain/Actividad";
import type { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { EstadoActividad as Estados } from "@/modules/actividades/domain/EstadoActividad";
import type {
  ActividadRepository,
  FiltroActividades,
} from "@/modules/actividades/domain/ActividadRepository";
import { ActividadNoEncontradaError } from "./errors";

// Doble en memoria para los tests de casos de uso. No toca la base ni Prisma. Las
// metas se guardan sin datos del recurso (`recurso: null`), suficiente para probar
// la lógica de aplicación; el detalle enriquecido lo resuelve la infraestructura.
export class InMemoryActividadRepository implements ActividadRepository {
  private readonly porId = new Map<string, Actividad>();
  private secuencia = 0;
  private metaSecuencia = 0;

  private nuevaMeta(meta: NuevaMeta): MetaRecurso {
    return {
      id: `meta-${++this.metaSecuencia}`,
      recursoId: meta.recursoId,
      cantidadObjetivo: meta.cantidadObjetivo,
      recurso: null,
      atenciones: [],
    };
  }

  async crear(datos: NuevaActividad): Promise<Actividad> {
    const ahora = new Date();
    const ayuda: Actividad = {
      id: `actividad-${++this.secuencia}`,
      adminId: datos.adminId,
      titulo: datos.titulo,
      sectorDestino: datos.sectorDestino,
      fecha: datos.fecha,
      horaFin: datos.horaFin,
      estado: Estados.RECOLECTANDO,
      tipo: datos.tipo,
      descripcion: datos.descripcion,
      puntosAcopio: datos.puntosAcopioIds.map((id) => ({
        id,
        nombre: "",
        referencia: "",
        horarios: "",
      })),
      metas: datos.metas.map((m) => this.nuevaMeta(m)),
      createdAt: ahora,
      updatedAt: ahora,
    };
    this.porId.set(ayuda.id, ayuda);
    return this.clonar(ayuda);
  }

  async listar(filtro?: FiltroActividades): Promise<Actividad[]> {
    let actividades = [...this.porId.values()];
    if (filtro?.estado) {
      actividades = actividades.filter((a) => a.estado === filtro.estado);
    }
    if (filtro?.tipo) {
      actividades = actividades.filter((a) => a.tipo === filtro.tipo);
    }
    if (filtro?.adminId) {
      actividades = actividades.filter((a) => a.adminId === filtro.adminId);
    }
    if (filtro?.puntoAcopioId) {
      actividades = actividades.filter((a) =>
        a.puntosAcopio.some((p) => p.id === filtro.puntoAcopioId),
      );
    }
    if (filtro?.fechaDesde) {
      actividades = actividades.filter((a) => a.fecha >= filtro.fechaDesde!);
    }
    if (filtro?.fechaHasta) {
      actividades = actividades.filter((a) => a.fecha <= filtro.fechaHasta!);
    }
    return actividades.map((a) => this.clonar(a));
  }

  async buscarPorId(id: string): Promise<Actividad | null> {
    const ayuda = this.porId.get(id);
    return ayuda ? this.clonar(ayuda) : null;
  }

  async actualizarCabecera(id: string, cambios: CambiosActividad): Promise<Actividad> {
    const actual = this.requerir(id);
    // `puntosAcopioIds` (si viene) reemplaza el conjunto; el resto son escalares.
    const { puntosAcopioIds, ...escalares } = cambios;
    const actualizado: Actividad = {
      ...actual,
      ...escalares,
      ...(puntosAcopioIds !== undefined
        ? {
            puntosAcopio: puntosAcopioIds.map((idPunto) => ({
              id: idPunto,
              nombre: "",
              referencia: "",
              horarios: "",
            })),
          }
        : {}),
      updatedAt: new Date(),
    };
    this.porId.set(id, actualizado);
    return this.clonar(actualizado);
  }

  async upsertMeta(actividadId: string, meta: NuevaMeta): Promise<Actividad> {
    const actual = this.requerir(actividadId);
    const existente = actual.metas.find((m) => m.recursoId === meta.recursoId);
    const metas = existente
      ? actual.metas.map((m) =>
          m.recursoId === meta.recursoId
            ? { ...m, cantidadObjetivo: meta.cantidadObjetivo }
            : m,
        )
      : [...actual.metas, this.nuevaMeta(meta)];
    const actualizado: Actividad = { ...actual, metas, updatedAt: new Date() };
    this.porId.set(actividadId, actualizado);
    return this.clonar(actualizado);
  }

  async quitarMeta(actividadId: string, recursoId: string): Promise<Actividad> {
    const actual = this.requerir(actividadId);
    const actualizado: Actividad = {
      ...actual,
      metas: actual.metas.filter((m) => m.recursoId !== recursoId),
      updatedAt: new Date(),
    };
    this.porId.set(actividadId, actualizado);
    return this.clonar(actualizado);
  }

  async cambiarEstado(id: string, estado: EstadoActividad): Promise<Actividad> {
    const actual = this.requerir(id);
    const actualizado: Actividad = { ...actual, estado, updatedAt: new Date() };
    this.porId.set(id, actualizado);
    return this.clonar(actualizado);
  }

  async eliminar(id: string): Promise<void> {
    this.requerir(id);
    this.porId.delete(id);
  }

  private requerir(id: string): Actividad {
    const ayuda = this.porId.get(id);
    if (!ayuda) throw new ActividadNoEncontradaError(id);
    return ayuda;
  }

  // Clona para que los tests no muten el estado interno por referencia.
  private clonar(ayuda: Actividad): Actividad {
    return {
      ...ayuda,
      metas: ayuda.metas.map((m) => ({ ...m })),
      puntosAcopio: ayuda.puntosAcopio.map((p) => ({ ...p })),
    };
  }
}
