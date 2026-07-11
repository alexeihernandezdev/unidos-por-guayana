import { porcentajeGlobalActividad } from "@/modules/aportes/application/porcentajeGlobalActividad";
import { progresoDeActividad } from "@/modules/aportes/application/progresoDeActividad";
import type { AporteDeps } from "@/modules/aportes/application/deps";
import type { Actividad } from "@/modules/actividades/domain/Actividad";
import type { ActividadDeps } from "./deps";

export type EnvioPublico = {
  ayuda: Actividad;
  porcentaje: number;
};

type Deps = Pick<ActividadDeps, "actividades"> & Pick<AporteDeps, "aportes" | "actividades">;

/**
 * Todas las actividades con su progreso global, ordenadas por fecha de salida
 * descendente (más reciente primero).
 */
export async function listarEnviosPublicos(deps: Deps): Promise<EnvioPublico[]> {
  const todas = await deps.actividades.listar();
  const ordenadas = todas.toSorted(
    (a, b) => b.fecha.getTime() - a.fecha.getTime(),
  );

  return Promise.all(
    ordenadas.map(async (ayuda) => ({
      ayuda,
      porcentaje: porcentajeGlobalActividad(
        await progresoDeActividad(deps, ayuda.id),
      ),
    })),
  );
}
