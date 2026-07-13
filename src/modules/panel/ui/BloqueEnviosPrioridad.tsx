import Link from "next/link";
import { ListChecks } from "lucide-react";
import { formatearFecha } from "@/modules/actividades/ui/fechas";
import type { EnvioPrioridadPanel } from "@/modules/panel/application/obtenerResumenPanel";
import { cn } from "@/shared/lib/utils";
import { TONO, tonoPorProgreso } from "./tonos";

type Props = {
  envios: EnvioPrioridadPanel[];
};

export function BloqueEnviosPrioridad({ envios }: Props) {
  return (
    <section
      aria-labelledby="titulo-prioridad"
      className="flex flex-col gap-3"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="titulo-prioridad"
          className="flex items-center gap-2.5 text-lg font-semibold leading-none tracking-tight"
        >
          <span
            className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary-ink"
            aria-hidden
          >
            <ListChecks strokeWidth={1.5} className="size-4" />
          </span>
          Qué actividad sale primero
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          por % de metas completado
        </span>
      </div>
      {envios.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-xs text-muted-foreground">
          No hay actividades en Recolectando.
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {envios.map((envio) => {
            const pct = Math.min(100, Math.round(envio.porcentaje));
            const t = TONO[tonoPorProgreso(pct)];
            return (
            <li key={envio.actividadId}>
              <Link
                href={`/panel/actividades/${envio.actividadId}`}
                className="focus-ring group flex flex-col gap-2 px-4 py-3 transition-colors duration-150 hover:bg-muted/40"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-base font-medium text-foreground">
                    {envio.titulo}
                  </span>
                  <span className="numeric-tnum font-mono text-xs text-foreground/70">
                    {formatearFecha(envio.fecha)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{envio.sectorDestino}</span>
                  {envio.solicitudesAfinesConteo > 0 ? (
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
                      {envio.solicitudesAfinesConteo} solicitud
                      {envio.solicitudesAfinesConteo === 1 ? "" : "es"} afín
                      {envio.solicitudesAfinesConteo === 1 ? "" : "es"}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                    aria-hidden
                  >
                    <div
                      className={cn("h-full rounded-full", t.barra)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "numeric-tnum font-mono text-xs font-medium",
                      t.valor,
                    )}
                  >
                    {pct} %
                  </span>
                </div>
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
