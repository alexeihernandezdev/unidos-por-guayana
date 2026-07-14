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
import type { SectorTop } from "@/modules/solicitudes/application/sectoresTop";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Props = {
  sectores: SectorTop[];
};

// El sector con más solicitudes abiertas se resalta en teal de marca; el resto en un
// teal atenuado. El color comunica "dónde aprieta más la demanda", no decora.
const COLOR_TOPE = "var(--primary)";
const COLOR_RESTO = "color-mix(in oklch, var(--primary) 45%, var(--card))";

// Barras horizontales de solicitudes abiertas por sector (equivalente al "Sales
// Report"). Ordenadas de mayor a menor demanda, con el conteo al final de cada barra.
export function GraficoSectoresBarras({ sectores }: Props) {
  const reducir = usePrefersReducedMotion();

  if (sectores.length === 0) {
    return (
      <div className="grid h-40 place-items-center text-center text-xs text-muted-foreground">
        No hay solicitudes abiertas por sector.
      </div>
    );
  }

  const maximo = Math.max(...sectores.map((s) => s.conteo));
  // Altura proporcional al número de barras para que respiren sin quedar aplastadas.
  const altura = sectores.length * 44 + 8;

  return (
    <div style={{ height: altura }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sectores}
          layout="vertical"
          margin={{ top: 0, right: 28, bottom: 0, left: 0 }}
          barCategoryGap="30%"
        >
          <XAxis type="number" domain={[0, maximo]} hide />
          <YAxis
            type="category"
            dataKey="sector"
            tickLine={false}
            axisLine={false}
            width={116}
            tick={{ fill: "var(--foreground)", fontSize: 12 }}
          />
          <Bar
            dataKey="conteo"
            radius={[0, 6, 6, 0]}
            barSize={16}
            isAnimationActive={!reducir}
            animationDuration={280}
            animationEasing="ease-out"
          >
            {sectores.map((s, index) => (
              <Cell
                key={s.sector}
                fill={index === 0 ? COLOR_TOPE : COLOR_RESTO}
              />
            ))}
            <LabelList
              dataKey="conteo"
              position="right"
              fill="var(--muted-foreground)"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
