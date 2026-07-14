import Link from "next/link";
import { CalendarHeart, HeartHandshake, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import { EstadoBadge } from "@/modules/actividades/ui/EstadoBadge";
import { formatearFecha } from "@/modules/actividades/ui/fechas";
import { etiquetaTipo } from "@/modules/actividades/ui/tipos";
import type { ActividadReciente } from "@/modules/panel/application/estadisticasActividades";
import { COLOR_TIPO } from "./coloresGraficos";

type Props = {
  actividades: ActividadReciente[];
};

// Ícono por tipo (misma familia lucide, strokeWidth 1.5). Da a cada fila una
// identidad visual como en el listado de transacciones del referente.
const ICONO_TIPO: Record<TipoActividad, LucideIcon> = {
  ENVIO: Truck,
  JORNADA: HeartHandshake,
  EVENTO_SOCIAL: CalendarHeart,
};

export function BloqueUltimasActividades({ actividades }: Props) {
  if (actividades.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-xs text-muted-foreground">
        Todavía no has registrado actividades.
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {actividades.map((actividad) => {
        const Icono = ICONO_TIPO[actividad.tipo];
        return (
          <li key={actividad.id}>
            <Link
              href={`/panel/actividades/${actividad.id}`}
              className="focus-ring group flex items-center gap-3 py-3 transition-colors duration-150 hover:bg-muted/40"
            >
              <span
                className="grid size-10 flex-none place-items-center rounded-lg"
                style={{
                  background: `color-mix(in oklch, ${COLOR_TIPO[actividad.tipo]} 14%, var(--card))`,
                  color: COLOR_TIPO[actividad.tipo],
                }}
                aria-hidden
              >
                <Icono strokeWidth={1.5} className="size-5" />
              </span>

              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-medium text-foreground">
                  {actividad.titulo}
                </span>
                <span className="text-xs text-muted-foreground">
                  {etiquetaTipo(actividad.tipo)} en {actividad.sectorDestino}
                </span>
              </div>

              <div className="ml-auto flex flex-none flex-col items-end gap-1">
                <EstadoBadge estado={actividad.estado} />
                <span className="numeric-tnum font-mono text-xs text-muted-foreground">
                  {formatearFecha(actividad.fecha)}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
