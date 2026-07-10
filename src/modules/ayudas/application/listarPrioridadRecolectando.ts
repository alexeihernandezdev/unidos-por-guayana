import { porcentajeGlobalAyuda } from "@/modules/aportes/application/porcentajeGlobalAyuda";
import { progresoDeAyuda } from "@/modules/aportes/application/progresoDeAyuda";
import type { AporteDeps } from "@/modules/aportes/application/deps";
import type { Ayuda } from "@/modules/ayudas/domain/Ayuda";
import { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import type { AyudaDeps } from "./deps";

export type EnvioPrioridad = {
  ayuda: Ayuda;
  porcentaje: number;
};

type Deps = Pick<AyudaDeps, "ayudas"> & Pick<AporteDeps, "aportes" | "ayudas">;

/**
 * Envíos en RECOLECTANDO ordenados por % de metas completado (desc) y, en empate,
 * por fecha de salida ascendente (más próximo primero).
 */
export async function listarPrioridadRecolectando(
  deps: Deps,
): Promise<EnvioPrioridad[]> {
  const recolectando = await deps.ayudas.listar({
    estado: EstadoAyuda.RECOLECTANDO,
  });

  const conPorcentaje = await Promise.all(
    recolectando.map(async (ayuda) => ({
      ayuda,
      porcentaje: porcentajeGlobalAyuda(
        await progresoDeAyuda(deps, ayuda.id),
      ),
    })),
  );

  return conPorcentaje.toSorted((a, b) => {
    if (b.porcentaje !== a.porcentaje) return b.porcentaje - a.porcentaje;
    return a.ayuda.fecha.getTime() - b.ayuda.fecha.getTime();
  });
}
