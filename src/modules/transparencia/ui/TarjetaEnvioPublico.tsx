import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
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
      className="focus-ring group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-[transform,box-shadow] duration-200 ease-[var(--ease-out-emil)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_rgb(0_0_0/0.18)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {envio.portadaUrl ? (
          <Image
            src={envio.portadaUrl}
            alt={`Portada de ${envio.titulo}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 22rem"
            className="object-cover transition-transform duration-500 ease-[var(--ease-out-emil)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-accent/10 text-muted-foreground/50"
          >
            <ImageIcon className="size-8" strokeWidth={1.25} />
          </div>
        )}
        {entregado && (
          <span className="absolute left-3 top-3 rounded-md border border-foreground/15 bg-background/85 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
            Destino cumplido
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4 md:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <TipoBadge tipo={envio.tipo} />
          <EstadoBadge estado={envio.estado} />
          <span className="numeric-tnum ml-auto shrink-0 font-mono text-xs text-muted-foreground">
            {formatearFecha(envio.fecha)}
          </span>
        </div>

        <h3 className="font-serif text-lg text-foreground [text-wrap:balance] group-hover:text-accent md:text-xl">
          {envio.titulo}
        </h3>

        <p className="text-sm text-muted-foreground">
          Destino:{" "}
          <span className="text-foreground/90">{envio.sectorDestino}</span>
        </p>

        <div className="mt-auto pt-1">
          <BarraProgreso porcentaje={envio.porcentaje} />
        </div>
      </div>
    </Link>
  );
}
