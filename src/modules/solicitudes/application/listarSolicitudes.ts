import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import type { FiltroSolicitudes } from "@/modules/solicitudes/domain/SolicitudRepository";
import type { SolicitudDeps } from "./deps";

export async function listarMisSolicitudes(
  { solicitudes }: Pick<SolicitudDeps, "solicitudes">,
  solicitanteId: string,
): Promise<Solicitud[]> {
  return solicitudes.listarDeSolicitante(solicitanteId);
}

export async function listarSolicitudes(
  { solicitudes }: Pick<SolicitudDeps, "solicitudes">,
  filtro?: FiltroSolicitudes,
): Promise<Solicitud[]> {
  return solicitudes.listar(filtro);
}
