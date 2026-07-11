import type {
  Aporte,
  NuevoAporte,
} from "@/modules/aportes/domain/Aporte";
import type { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import { EstadoAporte as Estados } from "@/modules/aportes/domain/EstadoAporte";
import type {
  AgregadoPorMeta,
  AportanteDeAyuda,
  AporteRepository,
  FiltroAportes,
  RecolectadoPorRecursoId,
} from "@/modules/aportes/domain/AporteRepository";

// Doble en memoria para los tests de casos de uso. No toca la base ni Prisma.
export class InMemoryAporteRepository implements AporteRepository {
  private readonly porId = new Map<string, Aporte>();
  private secuencia = 0;

  async crear(datos: NuevoAporte): Promise<Aporte> {
    const ahora = new Date();
    // Por defecto nace `COMPROMETIDO` (flujo 006); el ingreso monetario externo
    // (014) pasa `estado = RECIBIDO` y su `recibidoEn`.
    const estado = datos.estado ?? Estados.COMPROMETIDO;
    const aporte: Aporte = {
      id: `aporte-${++this.secuencia}`,
      ayudaId: datos.ayudaId,
      recursoId: datos.recursoId,
      colaboradorId: datos.colaboradorId,
      cantidad: datos.cantidad,
      moneda: datos.moneda ?? null,
      estado,
      nota: datos.nota,
      registradoPorId: datos.registradoPorId ?? null,
      medioDonacionId: datos.medioDonacionId ?? null,
      referencia: datos.referencia ?? null,
      recibidoEn:
        datos.recibidoEn ?? (estado === Estados.RECIBIDO ? ahora : null),
      createdAt: ahora,
      updatedAt: ahora,
      recurso: null,
      colaborador: null,
      medio: null,
    };
    this.porId.set(aporte.id, aporte);
    return this.clonar(aporte);
  }

  async buscarPorId(id: string): Promise<Aporte | null> {
    const aporte = this.porId.get(id);
    return aporte ? this.clonar(aporte) : null;
  }

  async listarPorAyuda(
    ayudaId: string,
    filtro?: FiltroAportes,
  ): Promise<Aporte[]> {
    return [...this.porId.values()]
      .filter((a) => a.ayudaId === ayudaId)
      .filter((a) => (filtro?.estado ? a.estado === filtro.estado : true))
      .map((a) => this.clonar(a));
  }

  async listarDeColaborador(colaboradorId: string): Promise<Aporte[]> {
    return [...this.porId.values()]
      .filter((a) => a.colaboradorId === colaboradorId)
      .map((a) => this.clonar(a));
  }

  /**
   * Solo para tests: inserta un aporte ya formado (con recurso/colaborador).
   */
  seed(aporte: Aporte): void {
    this.porId.set(aporte.id, this.clonar(aporte));
  }

  async listarAportantesDeAyuda(ayudaId: string): Promise<AportanteDeAyuda[]> {
    return [...this.porId.values()]
      .filter((a) => a.ayudaId === ayudaId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((a) => ({
        id: a.id,
        aportanteNombre: a.colaborador?.nombre ?? "(aportante)",
        recursoNombre: a.recurso?.nombre ?? "(recurso)",
        recursoUnidad: a.recurso?.unidad ?? "",
        cantidad: a.cantidad,
        estado: a.estado,
        fecha: a.createdAt,
      }));
  }

  async cambiarEstado(
    id: string,
    desde: EstadoAporte,
    hacia: EstadoAporte,
  ): Promise<Aporte | null> {
    const actual = this.porId.get(id);
    if (!actual || actual.estado !== desde) return null;
    const actualizado: Aporte = {
      ...actual,
      estado: hacia,
      recibidoEn: hacia === Estados.RECIBIDO ? new Date() : null,
      updatedAt: new Date(),
    };
    this.porId.set(id, actualizado);
    return this.clonar(actualizado);
  }

  async eliminar(id: string): Promise<void> {
    this.porId.delete(id);
  }

  async listarRecientes(limit: number): Promise<Aporte[]> {
    return [...this.porId.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, Math.max(0, limit))
      .map((a) => this.clonar(a));
  }

  async progresoPorAyuda(ayudaId: string): Promise<AgregadoPorMeta[]> {
    const acumulado = new Map<string, AgregadoPorMeta>();
    for (const aporte of this.porId.values()) {
      if (aporte.ayudaId !== ayudaId) continue;
      const actual = acumulado.get(aporte.recursoId) ?? {
        recursoId: aporte.recursoId,
        recibido: 0,
        prometido: 0,
      };
      if (aporte.estado === Estados.RECIBIDO) actual.recibido += aporte.cantidad;
      else if (aporte.estado === Estados.COMPROMETIDO)
        actual.prometido += aporte.cantidad;
      acumulado.set(aporte.recursoId, actual);
    }
    return [...acumulado.values()];
  }

  async listarIngresosExternos(): Promise<Aporte[]> {
    return [...this.porId.values()]
      .filter((a) => a.registradoPorId !== null)
      .sort((a, b) => {
        const fa = (a.recibidoEn ?? a.createdAt).getTime();
        const fb = (b.recibidoEn ?? b.createdAt).getTime();
        return fb - fa;
      })
      .map((a) => this.clonar(a));
  }

  async recolectadoGlobalPorRecurso(): Promise<RecolectadoPorRecursoId[]> {
    const acumulado = new Map<string, number>();
    for (const aporte of this.porId.values()) {
      if (aporte.estado !== Estados.RECIBIDO) continue;
      acumulado.set(
        aporte.recursoId,
        (acumulado.get(aporte.recursoId) ?? 0) + aporte.cantidad,
      );
    }
    return [...acumulado.entries()]
      .filter(([, cantidad]) => cantidad > 0)
      .map(([recursoId, cantidadRecibida]) => ({
        recursoId,
        cantidadRecibida,
      }));
  }

  async contar(filtro?: FiltroAportes): Promise<number> {
    return [...this.porId.values()].filter((a) => {
      if (filtro?.estado && a.estado !== filtro.estado) return false;
      if (filtro?.ayudaId && a.ayudaId !== filtro.ayudaId) return false;
      return true;
    }).length;
  }

  private clonar(aporte: Aporte): Aporte {
    return {
      ...aporte,
      recurso: aporte.recurso ? { ...aporte.recurso } : null,
      colaborador: aporte.colaborador ? { ...aporte.colaborador } : null,
      medio: aporte.medio ? { ...aporte.medio } : null,
    };
  }
}
