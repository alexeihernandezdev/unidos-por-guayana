import { Target, TrendingUp } from "lucide-react";
import type { ProgresoMetaDetalle } from "@/modules/aportes/domain/Aporte";
import { PanelList, PanelListRow } from "@/shared/ui/panel";

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

// Progreso de metas de una actividad como row-cards (feature 026, guía
// `constitution/ui-guidelines.md §5`). La barra de progreso vive en la línea
// secundaria; los objetivos numéricos en metadatos `font-mono`.
export function ProgresoMetas({ progreso }: Props) {
  if (progreso.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta actividad no tiene metas definidas.
      </p>
    );
  }

  return (
    <PanelList>
      {progreso.map((meta) => {
        const completa = meta.porcentaje >= 100;
        return (
        <PanelListRow
          key={meta.recursoId}
          icon={Target}
          title={meta.nombre}
          secondary={
            <span className="flex items-center gap-2">
              <span
                className="h-2 w-32 overflow-hidden rounded-md bg-muted"
                aria-hidden
              >
                <span
                  className={`block h-full rounded-full ${completa ? "bg-primary" : "bg-accent"}`}
                  style={{ width: `${porcentajeBarra(meta.porcentaje)}%` }}
                />
              </span>
              <span
                className={`numeric-tnum font-mono text-xs ${completa ? "font-medium text-primary-ink" : "text-muted-foreground"}`}
              >
                {formatearNumero(meta.porcentaje)}%
              </span>
            </span>
          }
          meta={[
            {
              icon: Target,
              label: "Objetivo",
              texto: (
                <span className="numeric-tnum font-mono">
                  {formatearNumero(meta.objetivo)} {meta.unidad}
                </span>
              ),
            },
            {
              icon: TrendingUp,
              label: "Recibido",
              texto: (
                <span className="numeric-tnum font-mono">
                  {formatearNumero(meta.recibido)} {meta.unidad}
                </span>
              ),
            },
            {
              icon: TrendingUp,
              label: "Prometido",
              texto: (
                <span className="numeric-tnum font-mono">
                  {formatearNumero(meta.prometido)} {meta.unidad}
                </span>
              ),
            },
          ]}
        />
        );
      })}
    </PanelList>
  );
}
