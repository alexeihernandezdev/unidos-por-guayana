import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  HeartPulse,
  MapPin,
  Target,
  Truck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { Actividad } from "@/modules/actividades/domain/Actividad";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import type { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import { cn } from "@/shared/lib/utils";
import { EstadoBadge } from "./EstadoBadge";
import { TipoBadge } from "./TipoBadge";
import { formatearFecha } from "./fechas";

type Props = {
  actividades: Actividad[];
};

const ICONO_TIPO: Record<TipoActividad, LucideIcon> = {
  ENVIO: Truck,
  JORNADA: HeartPulse,
  EVENTO_SOCIAL: UsersRound,
};

const SUPERFICIE_TIPO: Record<TipoActividad, string> = {
  ENVIO: "bg-primary-ink text-primary-foreground",
  JORNADA: "bg-accent text-accent-foreground",
  EVENTO_SOCIAL: "bg-foreground text-background",
};

function ActividadCard({ actividad }: { actividad: Actividad }) {
  const Icono = ICONO_TIPO[actividad.tipo];
  const aceptaAportes = actividad.estado === EstadoActividad.RECOLECTANDO;

  return (
    <article className="min-w-0">
      <Link
        href={`/actividades/${actividad.id}`}
        className="activity-card group flex h-full min-h-96 flex-col overflow-hidden rounded-xl border border-border/70 bg-card outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
        aria-label={`${aceptaAportes ? "Ver y aportar a" : "Ver"} ${actividad.titulo}`}
      >
        <div
          className={cn(
            "relative isolate flex aspect-[16/8] min-h-36 items-center justify-center overflow-hidden",
            SUPERFICIE_TIPO[actividad.tipo],
          )}
        >
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-20 size-52 rounded-full border border-current opacity-10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-16 size-56 rounded-full border border-current opacity-10"
          />
          <Icono className="size-16 opacity-20" strokeWidth={1} aria-hidden />

          <div className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
            <TipoBadge
              tipo={actividad.tipo}
              className="border-white/20 bg-background/90 text-foreground shadow-sm"
            />
            <EstadoBadge
              estado={actividad.estado}
              className="border-white/20 bg-background/90 shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <h2 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-foreground [text-wrap:balance]">
              {actividad.titulo}
            </h2>
            <ArrowUpRight
              className="activity-card-arrow mt-0.5 size-5 shrink-0 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>

          {actividad.descripcion ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-foreground/75 [text-wrap:pretty]">
              {actividad.descripcion}
            </p>
          ) : null}

          <dl className="mt-5 grid gap-3 border-t border-border/70 pt-4 text-sm">
            <div className="flex min-w-0 items-center gap-2.5">
              <MapPin
                className="size-4 shrink-0 text-primary-ink"
                strokeWidth={1.5}
                aria-hidden
              />
              <dt className="sr-only">Destino</dt>
              <dd className="truncate text-foreground/80">
                {actividad.sectorDestino}
              </dd>
            </div>
            <div className="flex items-center gap-2.5">
              <CalendarDays
                className="size-4 shrink-0 text-primary-ink"
                strokeWidth={1.5}
                aria-hidden
              />
              <dt className="sr-only">Fecha</dt>
              <dd className="font-mono text-xs text-foreground/80 numeric-tnum">
                {formatearFecha(actividad.fecha)}
              </dd>
            </div>
          </dl>

          <div className="mt-auto flex items-center justify-between gap-4 pt-5">
            <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground numeric-tnum">
              <Target className="size-4" strokeWidth={1.5} aria-hidden />
              {actividad.metas.length}{" "}
              {actividad.metas.length === 1 ? "meta" : "metas"}
            </span>
            <span className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm">
              {aceptaAportes ? "Ver y aportar" : "Ver actividad"}
              <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function ActividadesColaboradorGrid({ actividades }: Props) {
  return (
    <section aria-labelledby="actividades-disponibles" className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id="actividades-disponibles"
            className="text-xl font-semibold tracking-tight text-foreground"
          >
            Actividades disponibles
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Explora la red y encuentra dónde puedes sumar.
          </p>
        </div>
        <p className="shrink-0 font-mono text-xs text-muted-foreground numeric-tnum">
          {actividades.length}{" "}
          {actividades.length === 1 ? "resultado" : "resultados"}
        </p>
      </div>

      <div className="panel-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {actividades.map((actividad) => (
          <ActividadCard key={actividad.id} actividad={actividad} />
        ))}
      </div>
    </section>
  );
}
