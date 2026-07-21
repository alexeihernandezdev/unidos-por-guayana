import type { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import type {
  ResultadoAuditoria,
  EstadoVerificacionSolicitud,
} from "./EstadoVerificacionSolicitud";
import type { SolicitudAuditable } from "./AuditoriaSolicitud";

export type FiltrosAuditoria = {
  texto?: string;
  estado?: EstadoVerificacionSolicitud;
  urgencia?: UrgenciaSolicitud;
  auditorId?: string;
};

export type DictamenAuditoria = {
  solicitudId: string;
  auditorId: string;
  resultado: ResultadoAuditoria;
  metodo: string;
  notaInterna: string;
  explicacionPublica: string | null;
  referenciaExterna: string | null;
};

export interface AuditoriaRepository {
  listar(filtros?: FiltrosAuditoria): Promise<SolicitudAuditable[]>;
  buscarPorId(id: string): Promise<SolicitudAuditable | null>;
  tomar(solicitudId: string, auditorId: string): Promise<boolean>;
  liberar(solicitudId: string, auditorId: string): Promise<boolean>;
  dictaminar(input: DictamenAuditoria): Promise<boolean>;
  reenviar(solicitudId: string, solicitanteId: string): Promise<boolean>;
  liberarAsignaciones(auditorId: string, actorId: string): Promise<number>;
}
