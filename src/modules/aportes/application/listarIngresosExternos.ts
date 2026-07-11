import type { Aporte } from "@/modules/aportes/domain/Aporte";
import type { AporteDeps } from "./deps";

/**
 * Lista los ingresos monetarios externos imputados por un ADMIN (feature 014),
 * del más reciente al más antiguo. Alimenta la tabla de ingresos del panel.
 */
export function listarIngresosExternos({
  aportes,
}: Pick<AporteDeps, "aportes">): Promise<Aporte[]> {
  return aportes.listarIngresosExternos();
}
