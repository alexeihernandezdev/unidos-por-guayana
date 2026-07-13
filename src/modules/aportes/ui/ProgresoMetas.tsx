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

const celda = "px-3 py-3 text-sm align-middle";
const encabezado = "px-3 pb-2 text-xs font-medium text-muted-foreground";

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
          <tr className="border-b border-border text-left">
            <th className={encabezado}>Recurso</th>
            <th className={`${encabezado} text-right`}>Objetivo</th>
            <th className={`${encabezado} text-right`}>Recibido</th>
            <th className={`${encabezado} text-right`}>Prometido</th>
            <th className={`${encabezado} w-40`}>Progreso</th>
          </tr>
        </thead>
        <tbody>
          {progreso.map((meta) => {
            const completa = meta.porcentaje >= 100;
            return (
              <tr
                key={meta.recursoId}
                className="border-b border-border/60 last:border-0"
              >
                <td className={celda}>
                  <span className="font-medium text-foreground">{meta.nombre}</span>
                </td>
                <td className={`${celda} numeric-tnum text-right`}>
                  {formatearNumero(meta.objetivo)}{" "}
                  <span className="text-muted-foreground">{meta.unidad}</span>
                </td>
                <td className={`${celda} numeric-tnum text-right text-foreground`}>
                  {formatearNumero(meta.recibido)}{" "}
                  <span className="text-muted-foreground">{meta.unidad}</span>
                </td>
                <td
                  className={`${celda} numeric-tnum text-right text-muted-foreground`}
                >
                  {formatearNumero(meta.prometido)} {meta.unidad}
                </td>
                <td className={celda}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"
                      aria-hidden
                    >
                      <div
                        className={`h-full rounded-full ${completa ? "bg-primary" : "bg-accent"}`}
                        style={{ width: `${porcentajeBarra(meta.porcentaje)}%` }}
                      />
                    </div>
                    <span
                      className={`numeric-tnum text-xs ${completa ? "font-medium text-primary-ink" : "text-muted-foreground"}`}
                    >
                      {formatearNumero(meta.porcentaje)}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
