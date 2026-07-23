"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import type { EnvioResumenPublico } from "@/modules/transparencia/application/obtener-resumen-publico";
import { EnvioDestacado } from "./EnvioDestacado";
import { TarjetaEnvioPublico } from "./TarjetaEnvioPublico";

type Props = {
  envios: EnvioResumenPublico[];
};

type Filtro = "TODAS" | TipoActividad | "CUMPLIDAS";

const EASE_EMIL = [0.23, 1, 0.32, 1] as const;

const CUMPLIDOS: ReadonlySet<string> = new Set([
  EstadoActividad.ENTREGADO,
  EstadoActividad.REALIZADA,
]);

function coincide(envio: EnvioResumenPublico, filtro: Filtro): boolean {
  switch (filtro) {
    case "TODAS":
      return true;
    case "CUMPLIDAS":
      return CUMPLIDOS.has(envio.estado);
    default:
      return envio.tipo === filtro;
  }
}

const DEFINICION_FILTROS: { filtro: Filtro; etiqueta: string }[] = [
  { filtro: "TODAS", etiqueta: "Todas" },
  { filtro: TipoActividad.ENVIO, etiqueta: "Envíos" },
  { filtro: TipoActividad.JORNADA, etiqueta: "Jornadas" },
  { filtro: TipoActividad.EVENTO_SOCIAL, etiqueta: "Eventos" },
  { filtro: "CUMPLIDAS", etiqueta: "Cumplidas" },
];

export function GaleriaActividades({ envios }: Props) {
  const [filtro, setFiltro] = useState<Filtro>("TODAS");
  const reducir = useReducedMotion();

  // Solo se muestran los filtros con al menos un resultado (además de "Todas").
  const filtros = useMemo(
    () =>
      DEFINICION_FILTROS.map((def) => ({
        ...def,
        conteo: envios.filter((e) => coincide(e, def.filtro)).length,
      })).filter((def) => def.filtro === "TODAS" || def.conteo > 0),
    [envios],
  );

  const visibles = useMemo(
    () => envios.filter((e) => coincide(e, filtro)),
    [envios, filtro],
  );
  const destacada = visibles.find((e) => e.portadaUrl) ?? null;
  const resto = destacada
    ? visibles.filter((e) => e.actividadId !== destacada.actividadId)
    : visibles;

  const contenedorVar = {
    hidden: {},
    visible: { transition: { staggerChildren: reducir ? 0 : 0.05 } },
  };
  const itemVar = reducir
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 14, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.4, ease: EASE_EMIL },
        },
      };

  return (
    <section aria-labelledby="titulo-envios" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="titulo-envios"
            className="font-serif text-2xl font-medium tracking-tight text-foreground md:text-3xl"
          >
            Actividades y su progreso
          </h2>
          <p className="mt-2 max-w-[58ch] text-sm text-muted-foreground [text-wrap:pretty] md:text-base">
            Envíos, jornadas y eventos con destino visible. El porcentaje refleja
            cuánto de cada meta ya está confirmado.
          </p>
        </div>
      </div>

      {/* Filtros: chips de selección; el estado activo va en teal de marca. */}
      <div
        role="group"
        aria-label="Filtrar actividades por tipo o estado"
        className="-mx-1 flex flex-wrap gap-2 overflow-x-auto px-1 pb-1"
      >
        {filtros.map((def) => {
          const activo = def.filtro === filtro;
          return (
            <button
              key={def.filtro}
              type="button"
              onClick={() => setFiltro(def.filtro)}
              aria-pressed={activo}
              className={
                "focus-ring inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-200 ease-[var(--ease-out-emil)] " +
                (activo
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-foreground")
              }
            >
              {def.etiqueta}
              <span
                className={
                  "numeric-tnum font-mono text-xs " +
                  (activo ? "text-white/75" : "text-muted-foreground")
                }
              >
                {def.conteo}
              </span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {visibles.length}{" "}
        {visibles.length === 1 ? "actividad" : "actividades"} en la vista actual.
      </p>

      {visibles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 px-4 py-12 text-center text-sm text-muted-foreground">
          No hay actividades en este filtro todavía.
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={filtro}
            variants={contenedorVar}
            initial="hidden"
            animate="visible"
            exit={reducir ? undefined : { opacity: 0, transition: { duration: 0.15 } }}
            className="flex flex-col gap-6"
          >
            {destacada && (
              <motion.div variants={itemVar}>
                <EnvioDestacado envio={destacada} />
              </motion.div>
            )}
            {resto.length > 0 && (
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {resto.map((envio) => (
                  <motion.li
                    key={envio.actividadId}
                    variants={itemVar}
                    className="flex"
                  >
                    <TarjetaEnvioPublico envio={envio} />
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}
