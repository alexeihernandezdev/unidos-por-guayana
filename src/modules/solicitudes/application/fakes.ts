import type {
  CambiosSolicitud,
  NuevaSolicitud,
  NuevoRecursoSolicitud,
  Solicitud,
} from "@/modules/solicitudes/domain/Solicitud";
import type { CerradaPor } from "@/modules/solicitudes/domain/CerradaPor";
import type { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import { EstadoSolicitud as Estados } from "@/modules/solicitudes/domain/EstadoSolicitud";
import type {
  FiltroSolicitudes,
  SolicitudRepository,
} from "@/modules/solicitudes/domain/SolicitudRepository";
import { SolicitudNoEncontradaError } from "./errors";

export class InMemorySolicitudRepository implements SolicitudRepository {
  private readonly porId = new Map<string, Solicitud>();
  private secuencia = 0;
  private recursoSecuencia = 0;

  private nuevoRecurso(meta: NuevoRecursoSolicitud) {
    return {
      id: `rs-${++this.recursoSecuencia}`,
      recursoId: meta.recursoId,
      cantidadEstimada: meta.cantidadEstimada ?? null,
      recurso: null,
    };
  }

  async crear(datos: NuevaSolicitud): Promise<Solicitud> {
    const ahora = new Date();
    const solicitud: Solicitud = {
      id: `sol-${++this.secuencia}`,
      sector: datos.sector,
      urgencia: datos.urgencia,
      descripcion: datos.descripcion,
      estado: Estados.ABIERTA,
      cerradaPor: null,
      solicitanteId: datos.solicitanteId,
      recursos: datos.recursos.map((r) => this.nuevoRecurso(r)),
      createdAt: ahora,
      updatedAt: ahora,
    };
    this.porId.set(solicitud.id, solicitud);
    return this.clonar(solicitud);
  }

  async buscarPorId(id: string): Promise<Solicitud | null> {
    const solicitud = this.porId.get(id);
    return solicitud ? this.clonar(solicitud) : null;
  }

  async listarDeSolicitante(solicitanteId: string): Promise<Solicitud[]> {
    return [...this.porId.values()]
      .filter((s) => s.solicitanteId === solicitanteId)
      .map((s) => this.clonar(s));
  }

  async listar(filtro?: FiltroSolicitudes): Promise<Solicitud[]> {
    let solicitudes = [...this.porId.values()];
    if (filtro?.sector) {
      solicitudes = solicitudes.filter((s) => s.sector === filtro.sector);
    }
    if (filtro?.urgencia) {
      solicitudes = solicitudes.filter((s) => s.urgencia === filtro.urgencia);
    }
    if (filtro?.estado) {
      solicitudes = solicitudes.filter((s) => s.estado === filtro.estado);
    }
    if (filtro?.solicitanteId) {
      solicitudes = solicitudes.filter(
        (s) => s.solicitanteId === filtro.solicitanteId,
      );
    }
    return solicitudes.map((s) => this.clonar(s));
  }

  async actualizarCabecera(
    id: string,
    cambios: CambiosSolicitud,
  ): Promise<Solicitud> {
    const actual = this.requerir(id);
    const actualizado: Solicitud = {
      ...actual,
      ...cambios,
      updatedAt: new Date(),
    };
    this.porId.set(id, actualizado);
    return this.clonar(actualizado);
  }

  async reemplazarRecursos(
    solicitudId: string,
    recursos: NuevoRecursoSolicitud[],
  ): Promise<Solicitud> {
    const actual = this.requerir(solicitudId);
    const actualizado: Solicitud = {
      ...actual,
      recursos: recursos.map((r) => this.nuevoRecurso(r)),
      updatedAt: new Date(),
    };
    this.porId.set(solicitudId, actualizado);
    return this.clonar(actualizado);
  }

  async cambiarEstado(
    id: string,
    nuevoEstado: EstadoSolicitud,
    cerradaPor?: CerradaPor | null,
  ): Promise<Solicitud> {
    const actual = this.requerir(id);
    const actualizado: Solicitud = {
      ...actual,
      estado: nuevoEstado,
      cerradaPor: cerradaPor ?? actual.cerradaPor,
      updatedAt: new Date(),
    };
    this.porId.set(id, actualizado);
    return this.clonar(actualizado);
  }

  private requerir(id: string): Solicitud {
    const solicitud = this.porId.get(id);
    if (!solicitud) throw new SolicitudNoEncontradaError(id);
    return solicitud;
  }

  private clonar(solicitud: Solicitud): Solicitud {
    return { ...solicitud, recursos: solicitud.recursos.map((r) => ({ ...r })) };
  }
}
