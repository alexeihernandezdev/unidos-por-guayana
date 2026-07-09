import type { Aporte } from "@/modules/aportes/domain/Aporte";
import type { FiltroAportes } from "@/modules/aportes/domain/AporteRepository";
import type { AporteDeps } from "./deps";

export async function listarAportesPorAyuda(
  { aportes }: Pick<AporteDeps, "aportes">,
  ayudaId: string,
  filtro?: FiltroAportes,
): Promise<Aporte[]> {
  return aportes.listarPorAyuda(ayudaId, filtro);
}

export async function listarAportesDeColaborador(
  { aportes }: Pick<AporteDeps, "aportes">,
  colaboradorId: string,
): Promise<Aporte[]> {
  return aportes.listarDeColaborador(colaboradorId);
}

/** Feed del dashboard del ADMIN: últimos N aportes creados en la plataforma. */
export async function listarAportesRecientes(
  { aportes }: Pick<AporteDeps, "aportes">,
  limit: number,
): Promise<Aporte[]> {
  return aportes.listarRecientes(limit);
}
