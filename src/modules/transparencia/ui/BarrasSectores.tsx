"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { ResumenSector } from "@/modules/transparencia/application/derivarPanel";
import { usePrefersReducedMotion } from "@/modules/panel/ui/usePrefersReducedMotion";
import { TEAL_BRILLANTE, TEAL_TENUE } from "./coloresPanel";

type Props = {
  sectores: ResumenSector[];
};

// Barras horizontales: a dónde llega la ayuda, ordenado por cantidad de actividades
// (comparación → barras). El sector con más actividades va en teal brillante; el resto en
// teal tenue. El color comunica "dónde se concentra", no decora.
export function BarrasSectores({ sectores }: Props) {
  const reducir = usePrefersReducedMotion();

  if (sectores.length === 0) {
    return (
      <div className="grid h-40 place-items-center text-center text-xs text-white/50">
        Aún no hay destinos publicados.
      </div>
    );
  }

  const maximo = Math.max(...sectores.map((s) => s.conteo));
  const altura = sectores.length * 46 + 8;

  return (
    <div style={{ height: altura }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sectores}
          layout="vertical"
          margin={{ top: 0, right: 30, bottom: 0, left: 0 }}
          barCategoryGap="32%"
        >
          <XAxis type="number" domain={[0, maximo]} hide />
          <YAxis
            type="category"
            dataKey="sector"
            tickLine={false}
            axisLine={false}
            width={120}
            tick={{ fill: "rgba(255,255,255,0.82)", fontSize: 12 }}
          />
          <Bar
            dataKey="conteo"
            radius={[0, 6, 6, 0]}
            barSize={16}
            isAnimationActive={!reducir}
            animationDuration={700}
            animationEasing="ease-out"
          >
            {sectores.map((s, index) => (
              <Cell
                key={s.sector}
                fill={index === 0 ? TEAL_BRILLANTE : TEAL_TENUE}
              />
            ))}
            <LabelList
              dataKey="conteo"
              position="right"
              fill="rgba(255,255,255,0.6)"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
