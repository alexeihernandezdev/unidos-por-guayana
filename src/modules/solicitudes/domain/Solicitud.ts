import type { ArchivoSolicitud } from "./ArchivoSolicitud";
import type { EstadoVerificacionSolicitud } from "@/modules/auditoria/domain/EstadoVerificacionSolicitud";
import type { CerradaPor } from "./CerradaPor";
import type { EstadoSolicitud } from "./EstadoSolicitud";
import type { UrgenciaSolicitud } from "./UrgenciaSolicitud";

export type RecursoSolicitud = {
  id: string;
  recursoId: string;
  cantidadEstimada: number | null;
  recurso: { id: string; nombre: string; unidad: string } | null;
  // Actividad que atiende este recurso, si el ADMIN lo vinculó (feature 030). Derivado
  // de `AtencionNecesidad`; `null` mientras el recurso sigue sin atender. Alimenta el
  // badge "Atendido por actividad X" en las vistas de solicitud.
  atencion: { actividadId: string; actividadTitulo: string } | null;
};

// Ubicación por catálogo (feature 035). Los nombres se resuelven en lectura para
// las vistas; los ids son la fuente de verdad al escribir.
export type UbicacionSolicitud = {
  estadoId: string;
  estadoNombre: string;
  municipioId: string;
  municipioNombre: string;
};

export type Solicitud = {
  id: string;
  sector: string;
  estadoId: string;
  estadoNombre: string;
  municipioId: string;
  municipioNombre: string;
  urgencia: UrgenciaSolicitud;
  descripcion: string;
  estado: EstadoSolicitud;
  estadoVerificacion: EstadoVerificacionSolicitud;
  auditorActualId: string | null;
  cicloAuditoria: number;
  cerradaPor: CerradaPor | null;
  solicitanteId: string;
  recursos: RecursoSolicitud[];
  archivos: ArchivoSolicitud[];
  createdAt: Date;
  updatedAt: Date;
};

export type NuevoRecursoSolicitud = {
  recursoId: string;
  cantidadEstimada?: number | null;
};

export type NuevaSolicitud = {
  sector: string;
  estadoId: string;
  municipioId: string;
  urgencia: UrgenciaSolicitud;
  descripcion: string;
  solicitanteId: string;
  recursos: NuevoRecursoSolicitud[];
};

export type CambiosSolicitud = {
  sector?: string;
  estadoId?: string;
  municipioId?: string;
  urgencia?: UrgenciaSolicitud;
  descripcion?: string;
};
