import type { AportanteDeActividad } from "@/modules/aportes/domain/AporteRepository";
import type { AporteDeps } from "./deps";

/**
 * Registro de reconocimiento de aportantes de una actividad (feature 023).
 * Devuelve solo nombre + recurso/cantidad/estado/fecha; sin datos de contacto.
 */
export async function listarAportantesDeActividad(
  { aportes }: Pick<AporteDeps, "aportes">,
  actividadId: string,
): Promise<AportanteDeActividad[]> {
  return aportes.listarAportantesDeActividad(actividadId);
}
