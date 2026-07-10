import { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import { normalizarSector } from "./sectoresTop";
import type { SolicitudDeps } from "./deps";

/** Solicitudes ABIERTA cuyo sector coincide (normalizado) con el indicado. */
export async function contarSolicitudesAbiertasPorSector(
  { solicitudes }: Pick<SolicitudDeps, "solicitudes">,
  sector: string,
): Promise<number> {
  const clave = normalizarSector(sector);
  if (!clave) return 0;
  const abiertas = await solicitudes.listar({ estado: EstadoSolicitud.ABIERTA });
  return abiertas.filter((s) => normalizarSector(s.sector) === clave).length;
}
