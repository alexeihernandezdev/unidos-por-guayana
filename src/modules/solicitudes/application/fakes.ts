import type {
  ArchivoSolicitud,
  NuevoArchivoSolicitud,
} from "@/modules/solicitudes/domain/ArchivoSolicitud";
import type {
  CambiosSolicitud,
  NuevaSolicitud,
  NuevoRecursoSolicitud,
  Solicitud,
} from "@/modules/solicitudes/domain/Solicitud";
import { TipoArchivoSolicitud } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import type { CerradaPor } from "@/modules/solicitudes/domain/CerradaPor";
import type { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import { EstadoSolicitud as Estados } from "@/modules/solicitudes/domain/EstadoSolicitud";
import type {
  FiltroSolicitudes,
  SolicitudRepository,
} from "@/modules/solicitudes/domain/SolicitudRepository";
import { EstadoVerificacionSolicitud } from "@/modules/auditoria/domain/EstadoVerificacionSolicitud";
import { SolicitudNoEncontradaError } from "./errors";

export class InMemorySolicitudRepository implements SolicitudRepository {
  private readonly porId = new Map<string, Solicitud>();
  private secuencia = 0;

  establecerEstadoVerificacion(
    id: string,
    estadoVerificacion: Solicitud["estadoVerificacion"],
  ): void {
    const actual = this.requerir(id);
    this.porId.set(id, { ...actual, estadoVerificacion, updatedAt: new Date() });
  }
  private recursoSecuencia = 0;

  private nuevoRecurso(meta: NuevoRecursoSolicitud) {
    return {
      id: `rs-${++this.recursoSecuencia}`,
      recursoId: meta.recursoId,
      cantidadEstimada: meta.cantidadEstimada ?? null,
      recurso: null,
      atencion: null,
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
      estadoVerificacion: EstadoVerificacionSolicitud.PENDIENTE,
      auditorActualId: null,
      cicloAuditoria: 1,
      cerradaPor: null,
      solicitanteId: datos.solicitanteId,
      recursos: datos.recursos.map((r) => this.nuevoRecurso(r)),
      archivos: [],
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

  // ── Archivos (feature 031) ──
  private archivoSecuencia = 0;

  async crearArchivo(nuevo: NuevoArchivoSolicitud): Promise<ArchivoSolicitud> {
    const solicitud = this.requerir(nuevo.solicitudId);
    const archivo: ArchivoSolicitud = {
      id: `arch-${++this.archivoSecuencia}`,
      tipo: nuevo.tipo,
      path: nuevo.path,
      nombreOriginal: nuevo.nombreOriginal,
      contentType: nuevo.contentType,
      tamanoBytes: nuevo.tamanoBytes,
      createdAt: new Date(),
    };
    solicitud.archivos = [...solicitud.archivos, archivo];
    return { ...archivo };
  }

  async eliminarArchivo(archivoId: string): Promise<void> {
    for (const solicitud of this.porId.values()) {
      const antes = solicitud.archivos.length;
      solicitud.archivos = solicitud.archivos.filter((a) => a.id !== archivoId);
      if (solicitud.archivos.length !== antes) return;
    }
  }

  async buscarArchivoPorId(
    archivoId: string,
  ): Promise<{ archivo: ArchivoSolicitud; solicitudId: string } | null> {
    for (const solicitud of this.porId.values()) {
      const archivo = solicitud.archivos.find((a) => a.id === archivoId);
      if (archivo) {
        return { archivo: { ...archivo }, solicitudId: solicitud.id };
      }
    }
    return null;
  }

  async contarAdjuntos(solicitudId: string): Promise<number> {
    const solicitud = this.porId.get(solicitudId);
    if (!solicitud) return 0;
    return solicitud.archivos.filter(
      (a) => a.tipo === TipoArchivoSolicitud.ADJUNTO,
    ).length;
  }

  async obtenerArchivoPrincipal(
    solicitudId: string,
  ): Promise<ArchivoSolicitud | null> {
    const solicitud = this.porId.get(solicitudId);
    if (!solicitud) return null;
    const principal = solicitud.archivos.find(
      (a) => a.tipo === TipoArchivoSolicitud.PRINCIPAL,
    );
    return principal ? { ...principal } : null;
  }

  private requerir(id: string): Solicitud {
    const solicitud = this.porId.get(id);
    if (!solicitud) throw new SolicitudNoEncontradaError(id);
    return solicitud;
  }

  private clonar(solicitud: Solicitud): Solicitud {
    return {
      ...solicitud,
      recursos: solicitud.recursos.map((r) => ({ ...r })),
      archivos: solicitud.archivos.map((a) => ({ ...a })),
    };
  }
}
