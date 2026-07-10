import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import type { AporteDeps } from "./deps";

export type RecolectadoRecursoPublico = {
  recursoId: string;
  recurso: string;
  unidad: string;
  categoria: CategoriaRecurso;
  cantidadRecibida: number;
};

/**
 * Suma de aportes RECIBIDO agrupada por recurso. Solo incluye recursos con
 * actividad (> 0). Para MONETARIO la moneda vive en `unidad` (p. ej. USD).
 */
export async function recolectadoPorRecurso({
  aportes,
  recursos,
}: Pick<AporteDeps, "aportes" | "recursos">): Promise<
  RecolectadoRecursoPublico[]
> {
  const agregados = await aportes.recolectadoGlobalPorRecurso();
  const resultado: RecolectadoRecursoPublico[] = [];

  for (const fila of agregados) {
    if (fila.cantidadRecibida <= 0) continue;
    const recurso = await recursos.buscarPorId(fila.recursoId);
    if (!recurso) continue;
    resultado.push({
      recursoId: fila.recursoId,
      recurso: recurso.nombre,
      unidad: recurso.unidad,
      categoria: recurso.categoria,
      cantidadRecibida: fila.cantidadRecibida,
    });
  }

  return resultado.toSorted((a, b) => a.recurso.localeCompare(b.recurso, "es"));
}
