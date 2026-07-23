import Image from "next/image";
import Link from "next/link";
import { EstadoBadge } from "@/modules/actividades/ui/EstadoBadge";
import { TipoBadge } from "@/modules/actividades/ui/TipoBadge";
import { formatearFecha } from "@/modules/actividades/ui/fechas";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import type { DetallePublico } from "@/modules/transparencia/application/obtener-detalle-publico";
import { BarraProgreso } from "./BarraProgreso";
import { GaleriaAdjuntos } from "./GaleriaAdjuntos";

type Props = {
  detalle: DetallePublico;
};

function formatearNumero(n: number): string {
  return new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(n);
}

export function DetalleEnvioPublico({ detalle }: Props) {
  const entregado = detalle.estado === EstadoActividad.ENTREGADO;

  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12 md:px-8 md:py-16">
      <div>
        <Link
          href="/transparencia"
          className="focus-ring text-sm text-muted-foreground transition-colors hover:text-accent"
        >
          ← Volver al tablero
        </Link>
      </div>

      {detalle.portadaUrl && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-muted sm:aspect-[2/1]">
          <Image
            src={detalle.portadaUrl}
            alt={`Portada de ${detalle.titulo}`}
            fill
            priority
            sizes="(max-width: 896px) 100vw, 56rem"
            className="object-cover"
          />
        </div>
      )}

      <header className="flex flex-col gap-4 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <TipoBadge tipo={detalle.tipo} />
          <EstadoBadge estado={detalle.estado} />
          {entregado ? (
            <span className="rounded-md border border-foreground/25 bg-foreground/5 px-2 py-0.5 text-xs font-medium text-foreground">
              Entregado · destino cumplido
            </span>
          ) : null}
        </div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground [text-wrap:balance] md:text-4xl">
          {detalle.titulo}
        </h1>
        <dl className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.12em]">
              Destino
            </dt>
            <dd className="mt-1 text-base text-foreground">
              {detalle.sectorDestino}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.12em]">
              Fecha
            </dt>
            <dd className="numeric-tnum mt-1 text-base text-foreground">
              {formatearFecha(detalle.fecha)}
            </dd>
          </div>
        </dl>
        <div className="mt-2 max-w-md">
          <p className="mb-2 text-xs text-muted-foreground">
            Progreso global de metas
          </p>
          <BarraProgreso porcentaje={detalle.porcentajeGlobal} />
        </div>
      </header>

      <section aria-labelledby="titulo-metas" className="flex flex-col gap-4">
        <h2
          id="titulo-metas"
          className="font-serif text-2xl font-medium tracking-tight"
        >
          Metas por recurso
        </h2>
        {detalle.metas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Esta actividad no tiene metas definidas.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border bg-card">
            {detalle.metas.map((meta) => (
              <li
                key={`${meta.recurso}-${meta.unidad}`}
                className="flex flex-col gap-3 px-4 py-4 md:px-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-foreground">{meta.recurso}</p>
                  <p className="numeric-tnum font-mono text-sm text-muted-foreground">
                    {formatearNumero(meta.cantidadRecibida)} /{" "}
                    {formatearNumero(meta.cantidadObjetivo)} {meta.unidad}
                  </p>
                </div>
                <BarraProgreso porcentaje={meta.porcentaje} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <GaleriaAdjuntos adjuntos={detalle.adjuntos} />
    </article>
  );
}
