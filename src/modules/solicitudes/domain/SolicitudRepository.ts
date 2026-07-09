import type {
  CambiosSolicitud,
  NuevaSolicitud,
  NuevoRecursoSolicitud,
  Solicitud,
} from "./Solicitud";
import type { CerradaPor } from "./CerradaPor";
import type { EstadoSolicitud } from "./EstadoSolicitud";
import type { UrgenciaSolicitud } from "./UrgenciaSolicitud";

export type FiltroSolicitudes = {
  sector?: string;
  urgencia?: UrgenciaSolicitud;
  estado?: EstadoSolicitud;
  solicitanteId?: string;
};

export interface SolicitudRepository {
  crear(datos: NuevaSolicitud): Promise<Solicitud>;
  buscarPorId(id: string): Promise<Solicitud | null>;
  listarDeSolicitante(solicitanteId: string): Promise<Solicitud[]>;
  listar(filtro?: FiltroSolicitudes): Promise<Solicitud[]>;
  actualizarCabecera(id: string, cambios: CambiosSolicitud): Promise<Solicitud>;
  reemplazarRecursos(
    solicitudId: string,
    recursos: NuevoRecursoSolicitud[],
  ): Promise<Solicitud>;
  cambiarEstado(
    id: string,
    nuevoEstado: EstadoSolicitud,
    cerradaPor?: CerradaPor | null,
  ): Promise<Solicitud>;
}
