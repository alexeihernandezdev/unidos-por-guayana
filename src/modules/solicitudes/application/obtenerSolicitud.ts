import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import type { SolicitudDeps } from "./deps";
import { SolicitudNoEncontradaError } from "./errors";

export async function obtenerSolicitud(
  { solicitudes }: Pick<SolicitudDeps, "solicitudes">,
  id: string,
): Promise<Solicitud> {
  const solicitud = await solicitudes.buscarPorId(id);
  if (!solicitud) {
    throw new SolicitudNoEncontradaError(id);
  }
  return solicitud;
}
