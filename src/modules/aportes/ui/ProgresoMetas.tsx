import type { ProgresoMetaDetalle } from "@/modules/aportes/domain/Aporte";

type Props = {
  progreso: ProgresoMetaDetalle[];
};

// Barra de progreso simple + cifras. Se muestra el porcentaje cap-eado a 100%
// en la barra, pero el número real (que puede superar 100) se muestra al lado.
function porcentajeBarra(porcentaje: number): number {
  if (!Number.isFinite(porcentaje) || porcentaje < 0) return 0;
  return Math.min(porcentaje, 100);
}

function formatearNumero(n: number): string {
  return new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(n);
}

const celda = "px-3 py-2 text-sm align-middle";

export function ProgresoMetas({ progreso }: Props) {
  if (progreso.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta actividad no tiene metas definidas.
      </p>
    );
  }
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <th className={celda}>Recurso</th>
            <th className={celda}>Objetivo</th>
            <th className={celda}>Recibido</th>
            <th className={celda}>Prometido</th>
            <th className={celda}>Progreso</th>
          </tr>
        </thead>
        <tbody>
          {progreso.map((meta) => (
            <tr
              key={meta.recursoId}
              className="border-b border-border/60 last:border-0"
            >
              <td className={celda}>
                <span className="font-medium">{meta.nombre}</span>
              </td>
              <td className={`${celda} numeric-tnum`}>
                {formatearNumero(meta.objetivo)} {meta.unidad}
              </td>
              <td className={`${celda} numeric-tnum`}>
                {formatearNumero(meta.recibido)} {meta.unidad}
              </td>
              <td className={`${celda} numeric-tnum text-muted-foreground`}>
                {formatearNumero(meta.prometido)} {meta.unidad}
              </td>
              <td className={celda}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-32 overflow-hidden rounded-md bg-muted"
                    aria-hidden
                  >
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${porcentajeBarra(meta.porcentaje)}%` }}
                    />
                  </div>
                  <span className="numeric-tnum text-xs text-muted-foreground">
                    {formatearNumero(meta.porcentaje)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
