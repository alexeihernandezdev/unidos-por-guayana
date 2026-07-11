import Link from "next/link";
import { EstadoBadge } from "@/modules/actividades/ui/EstadoBadge";
import { TipoBadge } from "@/modules/actividades/ui/TipoBadge";
import { formatearFecha } from "@/modules/actividades/ui/fechas";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import type { EnvioResumenPublico } from "@/modules/transparencia/application/obtener-resumen-publico";
import { BarraProgreso } from "./BarraProgreso";

type Props = {
  envio: EnvioResumenPublico;
};

export function TarjetaEnvioPublico({ envio }: Props) {
  const entregado = envio.estado === EstadoActividad.ENTREGADO;

  return (
    <Link
      href={`/transparencia/${envio.actividadId}`}
      className="focus-ring group flex flex-col gap-3 rounded-md border border-border bg-card px-4 py-4 transition-colors duration-150 hover:bg-muted/40 md:px-5 md:py-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <TipoBadge tipo={envio.tipo} />
            <EstadoBadge estado={envio.estado} />
            {entregado ? (
              <span className="rounded-md border border-foreground/25 bg-foreground/5 px-2 py-0.5 text-xs font-medium text-foreground">
                Destino cumplido
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 font-serif text-lg text-foreground group-hover:text-accent md:text-xl">
            {envio.titulo}
          </h3>
        </div>
        <span className="numeric-tnum shrink-0 font-mono text-xs text-muted-foreground">
          {formatearFecha(envio.fecha)}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Destino:{" "}
        <span className="text-foreground/90">{envio.sectorDestino}</span>
      </p>
      <BarraProgreso porcentaje={envio.porcentaje} />
    </Link>
  );
}
