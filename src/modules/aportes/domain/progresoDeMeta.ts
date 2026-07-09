import type { Aporte, ProgresoMeta } from "./Aporte";
import { EstadoAporte } from "./EstadoAporte";

/**
 * Calcula el progreso de una meta a partir de los aportes de una `(ayuda, recurso)`.
 * Solo los aportes `RECIBIDO` cuentan al porcentaje (decisión de la feature 006);
 * los `COMPROMETIDO` se exponen aparte como "prometido" para dar visibilidad al
 * ADMIN.
 *
 * `porcentaje` se devuelve en el rango [0, 100] sin capar por arriba (una meta
 * puede superarse). Si `cantidadObjetivo` no es positiva, `porcentaje = 0` para
 * evitar división por cero; el caso no debería darse (lo valida la feature 005).
 */
export function progresoDeMeta(
  aportes: readonly Pick<Aporte, "cantidad" | "estado">[],
  cantidadObjetivo: number,
): ProgresoMeta {
  let recibido = 0;
  let prometido = 0;
  for (const aporte of aportes) {
    if (aporte.estado === EstadoAporte.RECIBIDO) {
      recibido += aporte.cantidad;
    } else if (aporte.estado === EstadoAporte.COMPROMETIDO) {
      prometido += aporte.cantidad;
    }
  }
  const porcentaje =
    cantidadObjetivo > 0 ? (recibido / cantidadObjetivo) * 100 : 0;
  return { recibido, prometido, porcentaje };
}
