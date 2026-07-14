"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { etiquetaTipo } from "@/modules/actividades/ui/tipos";
import type { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import type { PuntoSerieMensual } from "@/modules/panel/application/estadisticasActividades";
import { COLOR_TIPO, ORDEN_TIPOS } from "./coloresGraficos";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Props = {
  serie: PuntoSerieMensual[];
};

type TooltipPayload = {
  dataKey: TipoActividad;
  value: number;
  color: string;
};

function TooltipGrafico({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const total = payload.reduce((acc, p) => acc + (p.value ?? 0), 0);
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
      <p className="mb-1.5 text-xs font-medium text-foreground">{label}</p>
      <ul className="flex flex-col gap-1">
        {payload
          .filter((p) => p.value > 0)
          .map((p) => (
            <li
              key={p.dataKey}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="size-2 rounded-full"
                  style={{ background: p.color }}
                  aria-hidden
                />
                {etiquetaTipo(p.dataKey)}
              </span>
              <span className="numeric-tnum font-mono text-foreground">
                {p.value}
              </span>
            </li>
          ))}
        <li className="mt-1 flex items-center justify-between gap-4 border-t border-border pt-1 text-xs">
          <span className="text-muted-foreground">Total</span>
          <span className="numeric-tnum font-mono font-medium text-foreground">
            {total}
          </span>
        </li>
      </ul>
    </div>
  );
}

// Tendencia mensual de actividades registradas, apiladas por tipo (últimos 6 meses).
// Reinterpreta el gráfico "Revenue" del referente: el eje Y va implícito (barras +
// tooltip), el foco está en la evolución y la mezcla de tipos.
export function GraficoTendenciaBarras({ serie }: Props) {
  const reducir = usePrefersReducedMotion();
  const hayDatos = serie.some((punto) => punto.total > 0);

  return (
    <div className="h-56 w-full">
      {!hayDatos ? (
        <div className="grid h-full place-items-center text-center text-xs text-muted-foreground">
          Sin actividades en los últimos meses.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={serie}
            margin={{ top: 8, right: 4, bottom: 0, left: -20 }}
            barCategoryGap="28%"
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="etiqueta"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              dy={4}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              width={32}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              content={<TooltipGrafico />}
            />
            {ORDEN_TIPOS.map((tipo, index) => (
              <Bar
                key={tipo}
                dataKey={tipo}
                stackId="actividades"
                fill={COLOR_TIPO[tipo]}
                radius={
                  index === ORDEN_TIPOS.length - 1 ? [4, 4, 0, 0] : undefined
                }
                maxBarSize={40}
                isAnimationActive={!reducir}
                animationDuration={280}
                animationEasing="ease-out"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
