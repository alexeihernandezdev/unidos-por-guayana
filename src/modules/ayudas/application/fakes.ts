import type {
  Ayuda,
  CambiosAyuda,
  MetaRecurso,
  NuevaAyuda,
  NuevaMeta,
} from "@/modules/ayudas/domain/Ayuda";
import type { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import { EstadoAyuda as Estados } from "@/modules/ayudas/domain/EstadoAyuda";
import type {
  AyudaRepository,
  FiltroAyudas,
} from "@/modules/ayudas/domain/AyudaRepository";
import { AyudaNoEncontradaError } from "./errors";

// Doble en memoria para los tests de casos de uso. No toca la base ni Prisma. Las
// metas se guardan sin datos del recurso (`recurso: null`), suficiente para probar
// la lógica de aplicación; el detalle enriquecido lo resuelve la infraestructura.
export class InMemoryAyudaRepository implements AyudaRepository {
  private readonly porId = new Map<string, Ayuda>();
  private secuencia = 0;
  private metaSecuencia = 0;

  private nuevaMeta(meta: NuevaMeta): MetaRecurso {
    return {
      id: `meta-${++this.metaSecuencia}`,
      recursoId: meta.recursoId,
      cantidadObjetivo: meta.cantidadObjetivo,
      recurso: null,
    };
  }

  async crear(datos: NuevaAyuda): Promise<Ayuda> {
    const ahora = new Date();
    const ayuda: Ayuda = {
      id: `ayuda-${++this.secuencia}`,
      titulo: datos.titulo,
      sectorDestino: datos.sectorDestino,
      fecha: datos.fecha,
      estado: Estados.RECOLECTANDO,
      descripcion: datos.descripcion,
      metas: datos.metas.map((m) => this.nuevaMeta(m)),
      createdAt: ahora,
      updatedAt: ahora,
    };
    this.porId.set(ayuda.id, ayuda);
    return this.clonar(ayuda);
  }

  async listar(filtro?: FiltroAyudas): Promise<Ayuda[]> {
    let ayudas = [...this.porId.values()];
    if (filtro?.estado) {
      ayudas = ayudas.filter((a) => a.estado === filtro.estado);
    }
    return ayudas.map((a) => this.clonar(a));
  }

  async buscarPorId(id: string): Promise<Ayuda | null> {
    const ayuda = this.porId.get(id);
    return ayuda ? this.clonar(ayuda) : null;
  }

  async actualizarCabecera(id: string, cambios: CambiosAyuda): Promise<Ayuda> {
    const actual = this.requerir(id);
    const actualizado: Ayuda = {
      ...actual,
      ...cambios,
      updatedAt: new Date(),
    };
    this.porId.set(id, actualizado);
    return this.clonar(actualizado);
  }

  async upsertMeta(ayudaId: string, meta: NuevaMeta): Promise<Ayuda> {
    const actual = this.requerir(ayudaId);
    const existente = actual.metas.find((m) => m.recursoId === meta.recursoId);
    const metas = existente
      ? actual.metas.map((m) =>
          m.recursoId === meta.recursoId
            ? { ...m, cantidadObjetivo: meta.cantidadObjetivo }
            : m,
        )
      : [...actual.metas, this.nuevaMeta(meta)];
    const actualizado: Ayuda = { ...actual, metas, updatedAt: new Date() };
    this.porId.set(ayudaId, actualizado);
    return this.clonar(actualizado);
  }

  async quitarMeta(ayudaId: string, recursoId: string): Promise<Ayuda> {
    const actual = this.requerir(ayudaId);
    const actualizado: Ayuda = {
      ...actual,
      metas: actual.metas.filter((m) => m.recursoId !== recursoId),
      updatedAt: new Date(),
    };
    this.porId.set(ayudaId, actualizado);
    return this.clonar(actualizado);
  }

  async cambiarEstado(id: string, estado: EstadoAyuda): Promise<Ayuda> {
    const actual = this.requerir(id);
    const actualizado: Ayuda = { ...actual, estado, updatedAt: new Date() };
    this.porId.set(id, actualizado);
    return this.clonar(actualizado);
  }

  async eliminar(id: string): Promise<void> {
    this.requerir(id);
    this.porId.delete(id);
  }

  private requerir(id: string): Ayuda {
    const ayuda = this.porId.get(id);
    if (!ayuda) throw new AyudaNoEncontradaError(id);
    return ayuda;
  }

  // Clona para que los tests no muten el estado interno por referencia.
  private clonar(ayuda: Ayuda): Ayuda {
    return { ...ayuda, metas: ayuda.metas.map((m) => ({ ...m })) };
  }
}
