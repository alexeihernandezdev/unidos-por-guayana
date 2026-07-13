import Link from "next/link";
import { ArrowRightIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { TONO, type Tono } from "./tonos";

type Props = {
  etiqueta: string;
  valor: number;
  icono: LucideIcon;
  tono: Tono;
  subtitulo?: string;
  href: string;
};

export function TarjetaMetrica({
  etiqueta,
  valor,
  icono: Icono,
  tono,
  subtitulo,
  href,
}: Props) {
  const t = TONO[tono];

  return (
    <Link
      href={href}
      className={cn(
        "focus-ring group flex flex-col gap-3 rounded-xl border p-5 transition-colors duration-150",
        t.card,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "grid size-10 place-items-center rounded-lg transition-transform duration-150 group-hover:scale-105",
            t.chip,
          )}
          aria-hidden
        >
          <Icono strokeWidth={1.5} className="size-5" />
        </span>
        <ArrowRightIcon
          strokeWidth={1.5}
          className={cn(
            "size-4 -translate-x-1 opacity-0 transition duration-150 group-hover:translate-x-0 group-hover:opacity-100",
            t.enlace,
          )}
          aria-hidden
        />
      </div>

      <div className="flex flex-col gap-1">
        <span
          className={cn(
            "numeric-tnum font-mono text-3xl font-medium leading-none",
            t.valor,
          )}
        >
          {valor}
        </span>
        <span className="text-sm font-medium text-foreground/80">
          {etiqueta}
        </span>
        {subtitulo ? (
          <span className="text-xs text-muted-foreground">{subtitulo}</span>
        ) : null}
      </div>
    </Link>
  );
}
