"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PuntoTemporal } from "@/modules/transparencia/application/derivarPanel";
import { usePrefersReducedMotion } from "@/modules/panel/ui/usePrefersReducedMotion";
import { TEAL_BRILLANTE } from "./coloresPanel";

type Props = {
  serie: PuntoTemporal[];
};

type TooltipPayload = { value: number; payload: PuntoTemporal };

function TooltipTemporal({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const valor = payload[0]?.value ?? 0;
  return (
    <div className="rounded-lg border border-white/15 bg-[oklch(0.15_0.04_194)] px-3 py-2 shadow-lg">
      <p className="mb-0.5 text-xs font-medium text-white">{label}</p>
      <p className="numeric-tnum font-mono text-xs text-white/70">
        {valor} {valor === 1 ? "actividad" : "actividades"}
      </p>
    </div>
  );
}

// Actividades por mes (tendencia → área). El relleno se desvanece hacia abajo para dar
// profundidad sin tapar los datos; el trazo va en teal brillante. Rango derivado de las
// propias fechas (ver `derivarPanel`).
export function AreaTemporal({ serie }: Props) {
  const reducir = usePrefersReducedMotion();
  const hayDatos = serie.some((p) => p.valor > 0);

  return (
    <div className="h-52 w-full">
      {!hayDatos ? (
        <div className="grid h-full place-items-center text-center text-xs text-white/50">
          Sin actividades registradas todavía.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={serie}
            margin={{ top: 8, right: 8, bottom: 0, left: -22 }}
          >
            <defs>
              <linearGradient id="areaTemporalFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={TEAL_BRILLANTE} stopOpacity={0.42} />
                <stop offset="100%" stopColor={TEAL_BRILLANTE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="etiqueta"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
              dy={4}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
              width={32}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }}
              content={<TooltipTemporal />}
            />
            <Area
              type="monotone"
              dataKey="valor"
              stroke={TEAL_BRILLANTE}
              strokeWidth={2}
              fill="url(#areaTemporalFill)"
              dot={{ r: 2.5, fill: TEAL_BRILLANTE, strokeWidth: 0 }}
              activeDot={{ r: 4, fill: TEAL_BRILLANTE, strokeWidth: 0 }}
              isAnimationActive={!reducir}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
