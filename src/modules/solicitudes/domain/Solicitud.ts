import type { CerradaPor } from "./CerradaPor";
import type { EstadoSolicitud } from "./EstadoSolicitud";
import type { UrgenciaSolicitud } from "./UrgenciaSolicitud";

export type RecursoSolicitud = {
  id: string;
  recursoId: string;
  cantidadEstimada: number | null;
  recurso: { id: string; nombre: string; unidad: string } | null;
};

export type Solicitud = {
  id: string;
  sector: string;
  urgencia: UrgenciaSolicitud;
  descripcion: string;
  estado: EstadoSolicitud;
  cerradaPor: CerradaPor | null;
  solicitanteId: string;
  recursos: RecursoSolicitud[];
  createdAt: Date;
  updatedAt: Date;
};

export type NuevoRecursoSolicitud = {
  recursoId: string;
  cantidadEstimada?: number | null;
};

export type NuevaSolicitud = {
  sector: string;
  urgencia: UrgenciaSolicitud;
  descripcion: string;
  solicitanteId: string;
  recursos: NuevoRecursoSolicitud[];
};

export type CambiosSolicitud = {
  sector?: string;
  urgencia?: UrgenciaSolicitud;
  descripcion?: string;
};
