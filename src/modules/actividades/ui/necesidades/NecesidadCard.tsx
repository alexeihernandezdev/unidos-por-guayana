"use client";

import { GripVertical, MapPin, User } from "lucide-react";
import type { NecesidadPendiente } from "@/modules/atenciones/domain/Atencion";
import { UrgenciaBadge } from "@/modules/solicitudes/ui/UrgenciaBadge";
import { cn } from "@/shared/lib/utils";

// Tarjeta de una necesidad pendiente del sidebar (feature 030). Presentacional pura: el
// arrastre lo aporta el envoltorio `DraggableNecesidad`, y esta misma tarjeta se
// reutiliza dentro del `DragOverlay` para el fantasma flotante.
//
// - `coincide`: el recurso ya es meta de la actividad → se resalta con `accent` para
//   priorizar los "match" (pregunta 5 del diseño).
// - `deshabilitada`: recurso no seleccionable (no APROBADO/activo) → no arrastrable.
// - `arrastrando`: la tarjeta original se atenúa mientras su copia flota.
// - `flotante`: la copia del overlay, con sombra de elevación.
export function NecesidadCard({
  necesidad,
  coincide = false,
  deshabilitada = false,
  arrastrando = false,
  flotante = false,
  className,
}: {
  necesidad: NecesidadPendiente;
  coincide?: boolean;
  deshabilitada?: boolean;
  arrastrando?: boolean;
  flotante?: boolean;
  className?: string;
}) {
  const { recurso } = necesidad;
  return (
    <article
      className={cn(
        "group/necesidad flex gap-2.5 rounded-lg border bg-card p-3 text-left",
        "transition-[border-color,box-shadow,opacity,transform] duration-200 ease-[var(--ease-out-emil)] motion-reduce:transition-none",
        coincide
          ? "border-accent/40 ring-1 ring-accent/25"
          : "border-border",
        !deshabilitada && !flotante && "hover:border-foreground/25",
        arrastrando && "opacity-40",
        flotante && "rotate-[1.5deg] border-foreground/20 shadow-lg shadow-black/10",
        deshabilitada && "opacity-60",
        className,
      )}
    >
      <span
        className={cn(
          "mt-0.5 shrink-0 text-muted-foreground/70",
          !deshabilitada && "cursor-grab group-active/necesidad:cursor-grabbing",
        )}
        aria-hidden
      >
        <GripVertical className="size-4" strokeWidth={1.5} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-sm font-medium text-foreground">
            {recurso.nombre}
          </p>
          <UrgenciaBadge urgencia={necesidad.urgencia} />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="numeric-tnum font-mono text-foreground/80">
            {necesidad.cantidadEstimada != null
              ? `${necesidad.cantidadEstimada} ${recurso.unidad}`
              : `— ${recurso.unidad}`}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" strokeWidth={1.5} aria-hidden />
            {necesidad.sector}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1">
            <User className="size-3 shrink-0" strokeWidth={1.5} aria-hidden />
            <span className="truncate">{necesidad.solicitanteNombre}</span>
          </span>
        </div>

        {coincide && (
          <span className="w-fit rounded-full bg-accent/10 px-2 py-0.5 text-[0.6875rem] font-medium text-accent">
            Ya es meta de esta actividad
          </span>
        )}
        {deshabilitada && (
          <span className="text-[0.6875rem] text-muted-foreground">
            Recurso no disponible en el catálogo
          </span>
        )}
      </div>
    </article>
  );
}
