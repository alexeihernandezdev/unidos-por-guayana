"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { etiquetaTipo } from "@/modules/actividades/ui/tipos";
import type { ConteosPorTipo } from "@/modules/panel/application/estadisticasActividades";
import { COLOR_TIPO, ORDEN_TIPOS } from "./coloresGraficos";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Props = {
  conteos: ConteosPorTipo;
  total: number;
};

// Donut de composición: cuántas actividades hay de cada tipo. Reinterpreta el
// "Total View Performance" del referente con la paleta del proyecto y el total al
// centro en tipografía mono tabular.
export function GraficoTiposDonut({ conteos, total }: Props) {
  const reducir = usePrefersReducedMotion();

  const datos = ORDEN_TIPOS.map((tipo) => ({
    tipo,
    nombre: etiquetaTipo(tipo),
    valor: conteos[tipo],
  })).filter((d) => d.valor > 0);

  return (
    <div className="flex flex-col">
      <div className="relative mx-auto h-52 w-full max-w-[15rem]">
        {total === 0 ? (
          <div className="grid h-full place-items-center text-center text-xs text-muted-foreground">
            Aún no hay actividades registradas.
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datos}
                  dataKey="valor"
                  nameKey="nombre"
                  innerRadius="66%"
                  outerRadius="94%"
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={datos.length > 1 ? 3 : 0}
                  stroke="var(--card)"
                  strokeWidth={2}
                  isAnimationActive={!reducir}
                  animationDuration={280}
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
                <span className="numeric-tnum font-mono text-4xl font-medium leading-none text-foreground">
                  {total}
                </span>
                <span className="mt-1.5 text-xs text-muted-foreground">
                  {total === 1 ? "actividad" : "actividades"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <ul className="mt-6 flex flex-col gap-2.5">
        {ORDEN_TIPOS.map((tipo) => {
          const valor = conteos[tipo];
          const pct = total === 0 ? 0 : Math.round((valor / total) * 100);
          return (
            <li
              key={tipo}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-2 text-foreground/80">
                <span
                  className="size-2.5 flex-none rounded-full"
                  style={{ background: COLOR_TIPO[tipo] }}
                  aria-hidden
                />
                {etiquetaTipo(tipo)}
              </span>
              <span className="numeric-tnum font-mono text-xs text-muted-foreground">
                {valor} ({pct} %)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
