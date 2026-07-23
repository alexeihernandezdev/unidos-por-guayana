import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { derivarPanel } from "@/modules/transparencia/application/derivarPanel";
import type { ResumenPublico } from "@/modules/transparencia/application/obtener-resumen-publico";
import { GaleriaActividades } from "./GaleriaActividades";
import { PanelImpacto } from "./PanelImpacto";
import { RecolectadoPorRecurso } from "./RecolectadoPorRecurso";

type Props = {
  resumen: ResumenPublico;
};

export function ResumenTransparencia({ resumen }: Props) {
  const panel = derivarPanel(resumen);

  return (
    <div className="flex flex-col">
      <header className="mx-auto w-full max-w-6xl px-6 pb-4 pt-14 md:px-8 md:pt-20">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Tablero público
          </p>
          <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-foreground [text-wrap:balance] md:text-6xl">
            Transparencia de la operación
          </h1>
          <p className="mt-5 max-w-[58ch] text-base text-foreground/85 [text-wrap:pretty] md:text-lg md:leading-relaxed">
            Cualquiera puede ver qué se recolectó, cuánto falta y a dónde va cada
            actividad. Sin iniciar sesión y sin datos personales de quien aporta.
          </p>
        </div>
      </header>

      {/* Command center: banda oscura full-bleed con las cifras y las gráficas. */}
      <div className="mt-10 md:mt-14">
        <PanelImpacto panel={panel} />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 md:px-8 md:py-24">
        <RecolectadoPorRecurso filas={resumen.recolectadoPorRecurso} />
        <GaleriaActividades envios={resumen.envios} />

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-6 md:px-8">
          <p className="text-sm text-foreground/85 md:text-base">
            ¿Quieres que la próxima cifra incluya tu aporte?
          </p>
          <Link
            href="/registro?rol=COLABORADOR"
            className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-transform duration-200 ease-[var(--ease-out-emil)] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            Regístrate como colaborador
            <ArrowUpRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
              strokeWidth={1.5}
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
