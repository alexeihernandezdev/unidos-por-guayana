import Link from "next/link";
import { ArrowRightIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { TONO, type Tono } from "./tonos";

type Props = {
  etiqueta: string;
  valor: number;
  icono: LucideIcon;
  tono: Tono;
  subtitulo?: string;
  /** Progreso 0..100: si viene, se dibuja una barra en el pie de la tarjeta. */
  progreso?: number;
  /** Contenido libre para el pie (composición, microcopy de estado, etc.). */
  detalle?: ReactNode;
  href: string;
};

export function TarjetaMetrica({
  etiqueta,
  valor,
  icono: Icono,
  tono,
  subtitulo,
  progreso,
  detalle,
  href,
}: Props) {
  const t = TONO[tono];
  const pct =
    progreso === undefined
      ? undefined
      : Math.max(0, Math.min(100, Math.round(progreso)));

  return (
    <Link
      href={href}
      className={cn(
        "focus-ring group relative flex flex-col gap-4 overflow-hidden rounded-xl border p-5 transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-sm",
        t.card,
      )}
    >
      {/* Ícono fantasma: textura de fondo, whisper-quiet, da profundidad sin ruido. */}
      <Icono
        strokeWidth={1.5}
        className={cn(
          "pointer-events-none absolute -bottom-5 -right-4 size-28 opacity-[0.05] transition-transform duration-300 group-hover:scale-110 group-hover:opacity-[0.08]",
          t.valor,
        )}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "grid size-11 place-items-center rounded-xl ring-1 ring-inset ring-current/10 transition-transform duration-200 group-hover:scale-105",
            t.chip,
          )}
          aria-hidden
        >
          <Icono strokeWidth={1.5} className="size-5" />
        </span>
        <ArrowRightIcon
          strokeWidth={1.5}
          className={cn(
            "size-4 -translate-x-1 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100",
            t.enlace,
          )}
          aria-hidden
        />
      </div>

      <div className="flex flex-col gap-1">
        <span
          className={cn(
            "numeric-tnum font-mono text-4xl font-medium leading-none tracking-tight",
            t.valor,
          )}
        >
          {valor}
        </span>
        <span className="text-sm font-medium text-foreground/80">{etiqueta}</span>
      </div>

      {pct !== undefined ? (
        <div className="mt-auto flex flex-col gap-1.5">
          <div
            className="h-1.5 overflow-hidden rounded-full bg-foreground/10"
            aria-hidden
          >
            <div
              className={cn("h-full rounded-full", t.barra)}
              style={{ width: `${pct}%` }}
            />
          </div>
          {subtitulo ? (
            <span className="text-xs text-muted-foreground">{subtitulo}</span>
          ) : null}
        </div>
      ) : detalle ? (
        <div className="mt-auto">{detalle}</div>
      ) : subtitulo ? (
        <span className="mt-auto text-xs text-muted-foreground">{subtitulo}</span>
      ) : null}
    </Link>
  );
}
