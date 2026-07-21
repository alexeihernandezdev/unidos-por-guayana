import type { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import type { EstadoVerificacionSolicitud } from "./EstadoVerificacionSolicitud";

export const TipoEventoAuditoriaSolicitud = {
  CREADA: "CREADA",
  TOMADA: "TOMADA",
  LIBERADA: "LIBERADA",
  DICTAMEN: "DICTAMEN",
  REENVIADA: "REENVIADA",
} as const;

export type TipoEventoAuditoriaSolicitud =
  (typeof TipoEventoAuditoriaSolicitud)[keyof typeof TipoEventoAuditoriaSolicitud];

export type EventoAuditoriaSolicitud = {
  id: string;
  actorId: string;
  actorNombre: string;
  tipo: TipoEventoAuditoriaSolicitud;
  estadoResultante: EstadoVerificacionSolicitud;
  ciclo: number;
  metodo: string | null;
  notaInterna: string | null;
  explicacionPublica: string | null;
  referenciaExterna: string | null;
  createdAt: Date;
};

export type SolicitudAuditable = {
  id: string;
  sector: string;
  descripcion: string;
  urgencia: UrgenciaSolicitud;
  estadoVerificacion: EstadoVerificacionSolicitud;
  auditorActualId: string | null;
  auditorActualNombre: string | null;
  cicloAuditoria: number;
  solicitante: {
    id: string;
    nombre: string;
    email: string;
    telefono: string | null;
  };
  recursos: {
    id: string;
    nombre: string;
    unidad: string;
    cantidadEstimada: number | null;
  }[];
  eventos: EventoAuditoriaSolicitud[];
  createdAt: Date;
  updatedAt: Date;
};

export type AuditoriaVisible = {
  estado: EstadoVerificacionSolicitud;
  ciclo: number;
  eventos: Array<{
    id: string;
    tipo: TipoEventoAuditoriaSolicitud;
    estadoResultante: EstadoVerificacionSolicitud;
    ciclo: number;
    actorNombre: string;
    metodo: string | null;
    explicacionPublica: string | null;
    referenciaExterna: string | null;
    createdAt: Date;
  }>;
};
