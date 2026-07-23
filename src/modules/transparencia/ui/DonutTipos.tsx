"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { etiquetaTipo } from "@/modules/actividades/ui/tipos";
import type { ConteoTipo } from "@/modules/transparencia/application/derivarPanel";
import { usePrefersReducedMotion } from "@/modules/panel/ui/usePrefersReducedMotion";
import { COLOR_TIPO, PANEL_BG } from "./coloresPanel";

type Props = {
  porTipo: ConteoTipo[];
};

// Composición de actividades por tipo (proporción → donut). El total ocupa el centro en
// mono tabular; la leyenda usa el color de cada serie como único portador redundante con
// la etiqueta (nunca solo color). Sobre fondo oscuro.
export function DonutTipos({ porTipo }: Props) {
  const reducir = usePrefersReducedMotion();
  const total = porTipo.reduce((acc, d) => acc + d.valor, 0);
  const datos = porTipo.filter((d) => d.valor > 0);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-full max-w-[13rem]">
        {total === 0 ? (
          <div className="grid h-full place-items-center text-center text-xs text-white/50">
            Aún no hay actividades registradas.
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datos}
                  dataKey="valor"
                  nameKey="tipo"
                  innerRadius="66%"
                  outerRadius="96%"
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={datos.length > 1 ? 3 : 0}
                  stroke={PANEL_BG}
                  strokeWidth={2}
                  isAnimationActive={!reducir}
                  animationDuration={700}
                  animationEasing="ease-out"
                >
                  {datos.map((d) => (
                    <Cell key={d.tipo} fill={COLOR_TIPO[d.tipo]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center">
                <span className="numeric-tnum font-mono text-4xl font-medium leading-none text-white">
                  {total}
                </span>
                <span className="mt-1.5 text-[11px] text-white/55">
                  {total === 1 ? "actividad" : "actividades"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <ul className="mt-5 flex w-full flex-col gap-2">
        {porTipo.map((d) => {
          const pct = total === 0 ? 0 : Math.round((d.valor / total) * 100);
          return (
            <li
              key={d.tipo}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-2 text-white/75">
                <span
                  className="size-2.5 flex-none rounded-full"
                  style={{ background: COLOR_TIPO[d.tipo] }}
                  aria-hidden
                />
                {etiquetaTipo(d.tipo)}
              </span>
              <span className="numeric-tnum font-mono text-xs text-white/55">
                {d.valor} ({pct} %)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
