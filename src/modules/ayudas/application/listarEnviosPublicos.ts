import { porcentajeGlobalAyuda } from "@/modules/aportes/application/porcentajeGlobalAyuda";
import { progresoDeAyuda } from "@/modules/aportes/application/progresoDeAyuda";
import type { AporteDeps } from "@/modules/aportes/application/deps";
import type { Ayuda } from "@/modules/ayudas/domain/Ayuda";
import type { AyudaDeps } from "./deps";

export type EnvioPublico = {
  ayuda: Ayuda;
  porcentaje: number;
};

type Deps = Pick<AyudaDeps, "ayudas"> & Pick<AporteDeps, "aportes" | "ayudas">;

/**
 * Todas las actividades con su progreso global, ordenadas por fecha de salida
 * descendente (más reciente primero).
 */
export async function listarEnviosPublicos(deps: Deps): Promise<EnvioPublico[]> {
  const todas = await deps.ayudas.listar();
  const ordenadas = todas.toSorted(
    (a, b) => b.fecha.getTime() - a.fecha.getTime(),
  );

  return Promise.all(
    ordenadas.map(async (ayuda) => ({
      ayuda,
      porcentaje: porcentajeGlobalAyuda(
        await progresoDeAyuda(deps, ayuda.id),
      ),
    })),
  );
}
