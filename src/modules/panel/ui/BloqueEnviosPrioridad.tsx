import Link from "next/link";
import { formatearFecha } from "@/modules/ayudas/ui/fechas";
import type { EnvioPrioridadPanel } from "@/modules/panel/application/obtenerResumenPanel";

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
          className="font-serif text-lg leading-none tracking-tight"
        >
          Qué envío sale primero
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          por % de metas completado
        </span>
      </div>
      {envios.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-xs text-muted-foreground">
          No hay envíos en Recolectando.
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {envios.map((envio) => (
            <li key={envio.ayudaId}>
              <Link
                href={`/panel/ayudas/${envio.ayudaId}`}
                className="focus-ring group flex flex-col gap-2 px-4 py-3 transition-colors duration-150 hover:bg-muted/40"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-serif text-base text-foreground">
                    {envio.titulo}
                  </span>
                  <span className="numeric-tnum font-mono text-xs text-foreground/70">
                    {formatearFecha(envio.fecha)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{envio.sectorDestino}</span>
                  {envio.solicitudesAfinesConteo > 0 ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px]">
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
                      className="h-full bg-accent"
                      style={{
                        width: `${Math.min(100, Math.round(envio.porcentaje))}%`,
                      }}
                    />
                  </div>
                  <span className="numeric-tnum font-mono text-xs text-foreground/70">
                    {Math.round(envio.porcentaje)} %
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
