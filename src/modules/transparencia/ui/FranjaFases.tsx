"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  FASE_ETIQUETA,
  type ConteoFase,
} from "@/modules/transparencia/application/derivarPanel";
import { COLOR_FASE } from "./coloresPanel";

type Props = {
  fases: ConteoFase[];
};

const EASE_EMIL = [0.23, 1, 0.32, 1] as const;

// Franja segmentada que muestra en qué fase está la operación (una lectura tipo embudo:
// recolectando, preparado, en marcha, cumplido). Cada segmento ocupa una porción
// proporcional y se revela con un "wipe" desde la izquierda (scaleX, solo transform).
// La leyenda repite etiqueta + número, así el estado nunca se comunica solo por color.
export function FranjaFases({ fases }: Props) {
  const reducir = useReducedMotion();
  const total = fases.reduce((acc, f) => acc + f.valor, 0);

  if (total === 0) {
    return (
      <div className="grid h-16 place-items-center rounded-lg border border-dashed border-white/15 text-center text-xs text-white/50">
        Aún no hay actividades en curso.
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/10">
        {fases.map((f, i) =>
          f.valor > 0 ? (
            <motion.div
              key={f.fase}
              initial={reducir ? false : { scaleX: 0 }}
              whileInView={reducir ? undefined : { scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.7, ease: EASE_EMIL, delay: 0.1 + i * 0.12 }}
              style={{
                width: `${(f.valor / total) * 100}%`,
                background: COLOR_FASE[f.fase],
                transformOrigin: "left center",
              }}
              className="h-full will-change-transform"
              aria-hidden
            />
          ) : null,
        )}
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {fases.map((f) => {
          const pct = Math.round((f.valor / total) * 100);
          return (
            <li key={f.fase} className="flex flex-col gap-1.5">
              <span className="flex items-center gap-2 text-xs text-white/65">
                <span
                  className="size-2.5 flex-none rounded-full"
                  style={{ background: COLOR_FASE[f.fase] }}
                  aria-hidden
                />
                {FASE_ETIQUETA[f.fase]}
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="numeric-tnum font-mono text-2xl font-medium text-white">
                  {f.valor}
                </span>
                <span className="numeric-tnum font-mono text-[11px] text-white/45">
                  {pct} %
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
