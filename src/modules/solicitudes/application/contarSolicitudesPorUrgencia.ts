import type { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { UrgenciaSolicitud as Urgencias } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { EstadoSolicitud as Estados } from "@/modules/solicitudes/domain/EstadoSolicitud";
import type { FiltroSolicitudes } from "@/modules/solicitudes/domain/SolicitudRepository";
import type { SolicitudDeps } from "./deps";

export type ConteosPorUrgencia = Record<UrgenciaSolicitud, number>;

const URGENCIAS: UrgenciaSolicitud[] = [
  Urgencias.ALTA,
  Urgencias.MEDIA,
  Urgencias.BAJA,
];

export async function contarSolicitudesPorUrgencia(
  { solicitudes }: Pick<SolicitudDeps, "solicitudes">,
  filtro: Omit<FiltroSolicitudes, "urgencia"> = { estado: Estados.ABIERTA },
): Promise<ConteosPorUrgencia> {
  const abiertas = await solicitudes.listar(filtro);
  const conteos: ConteosPorUrgencia = {
    [Urgencias.ALTA]: 0,
    [Urgencias.MEDIA]: 0,
    [Urgencias.BAJA]: 0,
  };
  for (const s of abiertas) {
    conteos[s.urgencia]++;
  }
  return conteos;
}

export { URGENCIAS };
