"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { PanelTransparencia } from "@/modules/transparencia/application/derivarPanel";
import { ContadorAnimado } from "./ContadorAnimado";
import { AreaTemporal } from "./AreaTemporal";
import { BarrasSectores } from "./BarrasSectores";
import { DonutTipos } from "./DonutTipos";
import { FranjaFases } from "./FranjaFases";

type Props = {
  panel: PanelTransparencia;
};

const EASE_EMIL = [0.23, 1, 0.32, 1] as const;

// Bloque que aparece al entrar en viewport: fade + rise sutil (solo transform/opacity),
// escalonable por `orden`. Respeta reduced-motion (se muestra sin animar).
function Reveal({
  children,
  orden = 0,
  className = "",
}: {
  children: ReactNode;
  orden?: number;
  className?: string;
}) {
  const reducir = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reducir ? false : { opacity: 0, y: 16 }}
      whileInView={reducir ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: EASE_EMIL, delay: orden * 0.08 }}
    >
      {children}
    </motion.div>
  );
}

function TarjetaGrafico({
  titulo,
  descripcion,
  children,
  className = "",
}: {
  titulo: string;
  descripcion: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/12 bg-white/[0.04] p-5 backdrop-blur-sm md:p-6 ${className}`.trim()}
    >
      <div className="mb-5">
        <h3 className="font-serif text-lg font-medium text-white md:text-xl">
          {titulo}
        </h3>
        <p className="mt-1 text-xs text-white/55 [text-wrap:pretty]">
          {descripcion}
        </p>
      </div>
      {children}
    </div>
  );
}

const KPIS = [
  {
    clave: "actividades" as const,
    etiqueta: "actividades registradas",
    sufijo: "",
  },
  { clave: "avancePromedio" as const, etiqueta: "avance promedio", sufijo: " %" },
  {
    clave: "aportesConfirmados" as const,
    etiqueta: "aportes confirmados",
    sufijo: "",
  },
  {
    clave: "sectoresAlcanzados" as const,
    etiqueta: "sectores alcanzados",
    sufijo: "",
  },
];

// "Command center" público: banda teal petróleo oscura con el pulso de la operación en
// cifras animadas, la fase operativa y tres lecturas (composición, destinos, evolución).
// Full-bleed: da continuidad a la escena oscura de la landing que enlaza aquí.
export function PanelImpacto({ panel }: Props) {
  const { kpis } = panel;

  return (
    <section
      aria-labelledby="titulo-cifras"
      className="relative overflow-hidden border-y border-white/10 bg-[oklch(0.19_0.045_194)] text-white"
    >
      {/* Atmósfera: glow radial + retícula tenue, como la escena de la landing. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_82%_-4%,oklch(0.48_0.11_194/0.32),transparent_34%),radial-gradient(circle_at_4%_88%,oklch(0.4_0.08_185/0.2),transparent_32%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.1] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:72px_72px]"
      />
      {/* Número atmosférico gigante detrás del contenido. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-10 select-none font-serif text-[clamp(9rem,26vw,22rem)] font-medium leading-none text-white/[0.035]"
      >
        {kpis.avancePromedio}%
      </span>

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
        <Reveal>
          <div className="flex items-center gap-3 text-white/60">
            <span className="h-px w-10 bg-primary" aria-hidden />
            <span className="font-mono text-[11px] uppercase tracking-[0.16em]">
              El pulso de la operación
            </span>
          </div>
          <h2
            id="titulo-cifras"
            className="mt-6 max-w-3xl font-serif text-4xl font-medium leading-[0.95] tracking-[-0.02em] text-white [text-wrap:balance] md:text-6xl"
          >
            Cada cifra es ayuda que
            <span className="italic text-primary"> llegó a destino.</span>
          </h2>
        </Reveal>

        {/* KPIs: números serif grandes con contador animado, separados por hairlines. */}
        <Reveal orden={1} className="mt-14 md:mt-16">
          <ul className="grid border-y border-white/15 sm:grid-cols-2 lg:grid-cols-4">
            {KPIS.map((kpi, i) => (
              <li
                key={kpi.clave}
                className="flex items-baseline justify-between gap-5 border-white/15 py-6 sm:block sm:px-7 sm:py-8 sm:first:pl-0 lg:[&:not(:last-child)]:border-r sm:[&:nth-child(odd)]:pl-0 lg:[&:nth-child(odd)]:pl-7 lg:first:pl-0"
              >
                <ContadorAnimado
                  valor={kpis[kpi.clave]}
                  sufijo={kpi.sufijo}
                  duracion={1.2 + i * 0.15}
                  className="font-serif text-5xl font-medium text-white md:text-6xl"
                />
                <span className="mt-2 block text-xs text-white/55">
                  {kpi.etiqueta}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Franja de fases operativas. */}
        <Reveal orden={2} className="mt-14">
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-6 backdrop-blur-sm md:p-7">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-white md:text-xl">
                  En qué punto está cada actividad
                </h3>
                <p className="mt-1 text-xs text-white/55">
                  De la recolección a la entrega cumplida.
                </p>
              </div>
              <span className="numeric-tnum font-mono text-xs text-white/45">
                {kpis.cumplidas} de {kpis.actividades} cumplidas
              </span>
            </div>
            <FranjaFases fases={panel.fases} />
          </div>
        </Reveal>

        {/* Bento de gráficas. */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Reveal orden={3} className="lg:col-span-1">
            <TarjetaGrafico
              titulo="Composición"
              descripcion="Qué tipo de actividad concentra la operación."
              className="h-full"
            >
              <DonutTipos porTipo={panel.porTipo} />
            </TarjetaGrafico>
          </Reveal>

          <Reveal orden={4} className="lg:col-span-2">
            <TarjetaGrafico
              titulo="Actividades en el tiempo"
              descripcion="Cuándo se ha movido la ayuda, mes a mes."
              className="h-full"
            >
              <AreaTemporal serie={panel.serieMensual} />
            </TarjetaGrafico>
          </Reveal>

          <Reveal orden={5} className="lg:col-span-3">
            <TarjetaGrafico
              titulo="A dónde llega la ayuda"
              descripcion="Sectores destino con más actividades coordinadas."
            >
              <BarrasSectores sectores={panel.sectores} />
            </TarjetaGrafico>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
