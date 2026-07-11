import type { ProgresoMetaDetalle } from "@/modules/aportes/domain/Aporte";
import type { AporteDeps } from "./deps";
import { ActividadNoEncontradaError } from "@/modules/actividades/application/errors";

/**
 * Combina las metas de una Actividad (feature 005) con la agregación de aportes
 * (`recibido` / `prometido` por recurso) y devuelve el detalle de progreso por
 * cada meta. Solo los aportes `RECIBIDO` cuentan al porcentaje.
 */
export async function progresoDeActividad(
  { aportes, actividades }: Pick<AporteDeps, "aportes" | "actividades">,
  actividadId: string,
): Promise<ProgresoMetaDetalle[]> {
  const ayuda = await actividades.buscarPorId(actividadId);
  if (!ayuda) throw new ActividadNoEncontradaError(actividadId);

  const agregados = await aportes.progresoPorActividad(actividadId);
  const porRecurso = new Map(agregados.map((a) => [a.recursoId, a]));

  return ayuda.metas.map((meta) => {
    const agr = porRecurso.get(meta.recursoId);
    const recibido = agr?.recibido ?? 0;
    const prometido = agr?.prometido ?? 0;
    const porcentaje =
      meta.cantidadObjetivo > 0
        ? (recibido / meta.cantidadObjetivo) * 100
        : 0;
    return {
      recursoId: meta.recursoId,
      nombre: meta.recurso?.nombre ?? "(recurso)",
      unidad: meta.recurso?.unidad ?? "",
      objetivo: meta.cantidadObjetivo,
      recibido,
      prometido,
      porcentaje,
    };
  });
}
