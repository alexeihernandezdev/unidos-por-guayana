"use client";

import { useRef } from "react";
import Link from "next/link";
import { CalendarDays, ImageIcon, Package } from "lucide-react";
import {
  cubicBezier,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import { EstadoSolicitudBadge } from "./EstadoSolicitudBadge";
import { PortadaImagen } from "./PortadaImagen";
import { UrgenciaBadge } from "./UrgenciaBadge";
import { URGENCIA_RAIL } from "./urgencias";
import { formatearFechaCreacion } from "./fechas";
import { EstadoVerificacionBadge } from "@/modules/auditoria/ui";

// Tarjeta de solicitud con parallax de entrada ligado al scroll (feature 033), mismo
// patrón que `RolesSection` de la landing: cada tarjeta observa su posición en el
// viewport (progreso 0 al cruzar el 95 %, 1 al llegar al 55 %) y en ese recorrido baja
// su desfase a 0, escala 0.96→1 y funde. `prefers-reduced-motion` la deja estática y
// visible. Solo transforms + opacity (GPU), sin CLS.

const easeScroll = cubicBezier(0.45, 0, 0.55, 1);

// Desfases iniciales (px) que rotan por columna para una entrada en oleada, no en rampa.
const DESFASES = [44, 76, 58] as const;

type Props = {
  solicitud: Solicitud;
  href: string;
  /** URL firmada de la imagen principal (portada), si existe. */
  portada?: string;
  indice: number;
};

export function TarjetaSolicitud({ solicitud, href, portada, indice }: Props) {
  const sinMovimiento = useReducedMotion() === true;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.55"],
  });

  const desfase = DESFASES[indice % DESFASES.length];
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? [0, 0] : [desfase, 0],
    { ease: easeScroll },
  );
  const escala = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? [1, 1] : [0.96, 1],
    { ease: easeScroll },
  );
  const opacidad = useTransform(
    scrollYProgress,
    [0, 0.35],
    sinMovimiento ? [1, 1] : [0, 1],
  );

  return (
    <motion.div
      ref={ref}
      style={{ y, scale: escala, opacity: opacidad }}
      className="h-full will-change-transform"
    >
      <Link
        href={href}
        className="focus-ring group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[box-shadow,border-color,transform] duration-200 ease-[var(--ease-out-emil)] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
      >
        {/* Portada */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <span
            aria-hidden="true"
            className={`absolute inset-y-0 left-0 z-10 w-1 ${URGENCIA_RAIL[solicitud.urgencia]}`}
          />
          {portada ? (
            <PortadaImagen
              src={portada}
              alt={`Imagen de la solicitud de ${solicitud.sector}`}
              sizes="(min-width: 1280px) 24rem, (min-width: 640px) 45vw, 100vw"
              className="group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-muted">
              <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                <ImageIcon strokeWidth={1.5} className="size-7 opacity-70" />
                <span className="text-xs">Sin imagen</span>
              </div>
            </div>
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent"
          />
          <div className="absolute left-3 top-3 z-10">
            <UrgenciaBadge
              urgencia={solicitud.urgencia}
              className="bg-background/85 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Cuerpo */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-semibold text-foreground transition-colors duration-150 group-hover:text-primary-ink">
              {solicitud.sector}
            </h2>
            <p className="line-clamp-2 text-sm text-muted-foreground [text-wrap:pretty]">
              {solicitud.descripcion}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <EstadoSolicitudBadge estado={solicitud.estado} />
            <EstadoVerificacionBadge estado={solicitud.estadoVerificacion} />
          </div>

          <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-border/70 pt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Package className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">Recursos: </span>
              <span className="numeric-tnum font-mono">
                {solicitud.recursos.length}
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">Creada: </span>
              <span className="numeric-tnum font-mono">
                {formatearFechaCreacion(solicitud.createdAt)}
              </span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
