import type { AportanteDeAyuda } from "@/modules/aportes/domain/AporteRepository";
import type { AporteDeps } from "./deps";

/**
 * Registro de reconocimiento de aportantes de una actividad (feature 023).
 * Devuelve solo nombre + recurso/cantidad/estado/fecha; sin datos de contacto.
 */
export async function listarAportantesDeAyuda(
  { aportes }: Pick<AporteDeps, "aportes">,
  ayudaId: string,
): Promise<AportanteDeAyuda[]> {
  return aportes.listarAportantesDeAyuda(ayudaId);
}
