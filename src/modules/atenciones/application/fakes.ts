import type {
  AtencionInfo,
  NecesidadInfo,
  NecesidadPendiente,
} from "@/modules/atenciones/domain/Atencion";
import type { AtencionRepository } from "@/modules/atenciones/domain/AtencionRepository";

// Datos con los que se siembra una necesidad en el doble en memoria. Combina lo que
// devuelve `buscarNecesidad` (para validar) con lo que expone el sidebar.
export type NecesidadSeed = NecesidadInfo & {
  solicitudId: string;
  sector: string;
  urgencia: NecesidadPendiente["urgencia"];
  solicitanteNombre: string;
  recursoUnidad: string;
  recursoCategoria: NecesidadPendiente["recurso"]["categoria"];
};

type AtencionFila = {
  atencionId: string;
  actividadId: string;
  recursoSolicitudId: string;
  recursoId: string;
};

// Registro de una llamada a `vincular`, con la cantidad objetivo calculada.
type VinculoRegistrado = AtencionFila & { cantidadObjetivo: number };

// Doble en memoria del repositorio de atenciones para los tests de casos de uso. No
// toca Prisma. Registra las llamadas a `vincular` en `vinculos` para poder asertar.
export class InMemoryAtencionRepository implements AtencionRepository {
  private readonly necesidades = new Map<string, NecesidadSeed>();
  private readonly atenciones = new Map<string, AtencionFila>();
  private secuencia = 0;

  // Llamadas a `vincular`, para asertar cantidades y destino en los tests.
  readonly vinculos: VinculoRegistrado[] = [];

  constructor(seeds: NecesidadSeed[] = []) {
    for (const s of seeds) this.necesidades.set(s.recursoSolicitudId, s);
  }

  sembrarAtencion(fila: Omit<AtencionFila, "atencionId">): string {
    const atencionId = `atencion-${++this.secuencia}`;
    this.atenciones.set(atencionId, { ...fila, atencionId });
    const necesidad = this.necesidades.get(fila.recursoSolicitudId);
    if (necesidad) necesidad.yaAtendida = true;
    return atencionId;
  }

  async listarNecesidadesPendientes(): Promise<NecesidadPendiente[]> {
    return [...this.necesidades.values()]
      .filter((n) => n.solicitudAbierta && !n.yaAtendida)
      .map((n) => ({
        recursoSolicitudId: n.recursoSolicitudId,
        solicitudId: n.solicitudId,
        sector: n.sector,
        urgencia: n.urgencia,
        solicitanteNombre: n.solicitanteNombre,
        cantidadEstimada: n.cantidadEstimada,
        recurso: {
          id: n.recursoId,
          nombre: n.recursoNombre,
          unidad: n.recursoUnidad,
          categoria: n.recursoCategoria,
          seleccionable: n.recursoSeleccionable,
        },
      }));
  }

  async buscarNecesidad(
    recursoSolicitudId: string,
  ): Promise<NecesidadInfo | null> {
    const n = this.necesidades.get(recursoSolicitudId);
    if (!n) return null;
    return {
      recursoSolicitudId: n.recursoSolicitudId,
      recursoId: n.recursoId,
      cantidadEstimada: n.cantidadEstimada,
      solicitudAbierta: n.solicitudAbierta,
      yaAtendida: n.yaAtendida,
      recursoSeleccionable: n.recursoSeleccionable,
      recursoNombre: n.recursoNombre,
    };
  }

  async buscarAtencion(atencionId: string): Promise<AtencionInfo | null> {
    const a = this.atenciones.get(atencionId);
    return a ? { atencionId: a.atencionId, actividadId: a.actividadId } : null;
  }

  async vincular(datos: {
    recursoSolicitudId: string;
    actividadId: string;
    recursoId: string;
    cantidadObjetivo: number;
  }): Promise<void> {
    const atencionId = `atencion-${++this.secuencia}`;
    this.atenciones.set(atencionId, { atencionId, ...datos });
    this.vinculos.push({ atencionId, ...datos });
    const necesidad = this.necesidades.get(datos.recursoSolicitudId);
    if (necesidad) necesidad.yaAtendida = true;
  }

  async desvincular(atencionId: string): Promise<void> {
    const a = this.atenciones.get(atencionId);
    this.atenciones.delete(atencionId);
    if (a) {
      const necesidad = this.necesidades.get(a.recursoSolicitudId);
      if (necesidad) necesidad.yaAtendida = false;
    }
  }
}
