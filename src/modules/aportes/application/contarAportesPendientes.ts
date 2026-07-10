import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import type { AporteDeps } from "./deps";

/** Cuenta aportes en estado COMPROMETIDO (pendientes de confirmar por el ADMIN). */
export async function contarAportesPendientes({
  aportes,
}: Pick<AporteDeps, "aportes">): Promise<number> {
  return aportes.contar({ estado: EstadoAporte.COMPROMETIDO });
}
