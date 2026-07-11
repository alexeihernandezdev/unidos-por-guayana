import type { ProgresoMetaDetalle } from "@/modules/aportes/domain/Aporte";

/** Promedio de % por meta, cada una cap-ada a 100. Reutilizado en panel y transparencia. */
export function porcentajeGlobalActividad(
  progreso: readonly Pick<ProgresoMetaDetalle, "porcentaje">[],
): number {
  if (progreso.length === 0) return 0;
  const suma = progreso.reduce(
    (acc, p) => acc + Math.min(100, p.porcentaje),
    0,
  );
  return suma / progreso.length;
}
