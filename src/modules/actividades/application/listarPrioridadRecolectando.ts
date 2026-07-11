import { porcentajeGlobalActividad } from "@/modules/aportes/application/porcentajeGlobalActividad";
import { progresoDeActividad } from "@/modules/aportes/application/progresoDeActividad";
import type { AporteDeps } from "@/modules/aportes/application/deps";
import type { Actividad } from "@/modules/actividades/domain/Actividad";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import type { ActividadDeps } from "./deps";

export type EnvioPrioridad = {
  ayuda: Actividad;
  porcentaje: number;
};

type Deps = Pick<ActividadDeps, "actividades"> & Pick<AporteDeps, "aportes" | "actividades">;

/**
 * Envíos en RECOLECTANDO ordenados por % de metas completado (desc) y, en empate,
 * por fecha de salida ascendente (más próximo primero). Con `adminId` acota al
 * dueño (panel, feature 022).
 */
export async function listarPrioridadRecolectando(
  deps: Deps,
  adminId?: string,
): Promise<EnvioPrioridad[]> {
  const recolectando = await deps.actividades.listar({
    estado: EstadoActividad.RECOLECTANDO,
    ...(adminId ? { adminId } : {}),
  });

  const conPorcentaje = await Promise.all(
    recolectando.map(async (ayuda) => ({
      ayuda,
      porcentaje: porcentajeGlobalActividad(
        await progresoDeActividad(deps, ayuda.id),
      ),
    })),
  );

  return conPorcentaje.toSorted((a, b) => {
    if (b.porcentaje !== a.porcentaje) return b.porcentaje - a.porcentaje;
    return a.ayuda.fecha.getTime() - b.ayuda.fecha.getTime();
  });
}
