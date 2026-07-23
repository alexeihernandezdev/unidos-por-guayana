import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EstadoBadge } from "@/modules/actividades/ui/EstadoBadge";
import { TipoBadge } from "@/modules/actividades/ui/TipoBadge";
import { formatearFecha } from "@/modules/actividades/ui/fechas";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import type { EnvioResumenPublico } from "@/modules/transparencia/application/obtener-resumen-publico";

type Props = {
  envio: EnvioResumenPublico;
};

function porcentajeVisible(porcentaje: number): number {
  if (!Number.isFinite(porcentaje) || porcentaje < 0) return 0;
  return Math.min(100, Math.round(porcentaje));
}

// Actividad destacada del tablero público (feature 033): portada a lo ancho con overlay
// de título y progreso. Es la primera actividad reciente con imagen; da cara e impacto al
// tablero. Si no hubiera portada, no se renderiza (la elige `ListaEnviosPublicos`).
export function EnvioDestacado({ envio }: Props) {
  const entregado = envio.estado === EstadoActividad.ENTREGADO;
  const ancho = porcentajeVisible(envio.porcentaje);

  return (
    <Link
      href={`/transparencia/${envio.actividadId}`}
      className="focus-ring group relative block overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="relative aspect-[16/10] w-full sm:aspect-[2/1] lg:aspect-[21/9]">
        {envio.portadaUrl && (
          <Image
            src={envio.portadaUrl}
            alt={`Portada de ${envio.titulo}`}
            fill
            priority
            sizes="(max-width: 1152px) 100vw, 72rem"
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-emil)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
        {/* Degradado para asegurar contraste del texto sobre la foto. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 text-white md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <TipoBadge
            tipo={envio.tipo}
            className="border-white/30 bg-white/15 text-white backdrop-blur-sm"
          />
          <EstadoBadge
            estado={envio.estado}
            className="border-white/30 bg-white/15 text-white backdrop-blur-sm"
          />
          {entregado && (
            <span className="rounded-md border border-white/40 bg-white/10 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
              Destino cumplido
            </span>
          )}
          <span className="numeric-tnum ml-auto hidden font-mono text-xs text-white/80 sm:inline">
            {formatearFecha(envio.fecha)}
          </span>
        </div>

        <h3 className="max-w-[24ch] font-serif text-2xl font-medium tracking-tight [text-wrap:balance] md:text-4xl">
          {envio.titulo}
        </h3>

        <div className="flex items-center gap-4">
          <p className="text-sm text-white/85">
            Destino: <span className="text-white">{envio.sectorDestino}</span>
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none">
            Ver detalle
            <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-700 ease-[var(--ease-out-emil)] motion-reduce:transition-none"
              style={{ width: `${ancho}%` }}
            />
          </div>
          <span className="numeric-tnum shrink-0 font-mono text-sm text-white">
            {ancho} %
          </span>
        </div>
      </div>
    </Link>
  );
}
