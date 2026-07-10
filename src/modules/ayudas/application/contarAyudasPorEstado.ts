import type { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import { EstadoAyuda as Estados } from "@/modules/ayudas/domain/EstadoAyuda";
import type { AyudaDeps } from "./deps";

export type ConteosPorEstadoAyuda = Record<EstadoAyuda, number>;

const ESTADOS: EstadoAyuda[] = [
  Estados.RECOLECTANDO,
  Estados.LISTO,
  Estados.EN_TRANSITO,
  Estados.ENTREGADO,
];

/** Cuenta ayudas agrupadas por estado del ciclo de vida. */
export async function contarAyudasPorEstado({
  ayudas,
}: Pick<AyudaDeps, "ayudas">): Promise<ConteosPorEstadoAyuda> {
  const todas = await ayudas.listar();
  const conteos: ConteosPorEstadoAyuda = {
    [Estados.RECOLECTANDO]: 0,
    [Estados.LISTO]: 0,
    [Estados.EN_TRANSITO]: 0,
    [Estados.ENTREGADO]: 0,
  };
  for (const ayuda of todas) {
    conteos[ayuda.estado]++;
  }
  return conteos;
}

/** Conteos solo de envíos activos (excluye ENTREGADO). */
export function contarEnviosActivos(
  conteos: ConteosPorEstadoAyuda,
): Pick<ConteosPorEstadoAyuda, "RECOLECTANDO" | "LISTO" | "EN_TRANSITO"> {
  return {
    [Estados.RECOLECTANDO]: conteos[Estados.RECOLECTANDO],
    [Estados.LISTO]: conteos[Estados.LISTO],
    [Estados.EN_TRANSITO]: conteos[Estados.EN_TRANSITO],
  };
}

export { ESTADOS as ESTADOS_AYUDA_ORDEN };
