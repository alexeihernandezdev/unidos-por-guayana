import type { NecesidadPendiente } from "@/modules/atenciones/domain/Atencion";
import type { AtencionDeps } from "./deps";

/**
 * Lista las necesidades pendientes que alimentan el sidebar arrastrable: recursos de
 * solicitudes `ABIERTA` que aún no están atendidas por ninguna actividad. El filtrado
 * por texto/sector/urgencia/categoría y el resaltado de coincidencias con las metas de
 * la actividad se resuelven en el cliente sobre esta lista.
 */
export async function listarNecesidadesPendientes({
  atenciones,
}: Pick<AtencionDeps, "atenciones">): Promise<NecesidadPendiente[]> {
  return atenciones.listarNecesidadesPendientes();
}
