import Link from "next/link";
import { ArrowRightIcon, HandHeart } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { TONO } from "./tonos";

type Props = {
  conteo: number;
};

export function BloqueAportesPendientes({ conteo }: Props) {
  const t = TONO.warning;

  return (
    <section
      aria-labelledby="titulo-aportes-pendientes"
      className={cn("flex flex-col gap-3 rounded-xl border p-5", t.card)}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn("grid size-10 place-items-center rounded-lg", t.chip)}
          aria-hidden
        >
          <HandHeart strokeWidth={1.5} className="size-5" />
        </span>
        <h2
          id="titulo-aportes-pendientes"
          className="text-lg font-semibold leading-none tracking-tight"
        >
          Aportes por confirmar
        </h2>
      </div>
      <p className="text-sm text-foreground/70">
        Compromisos de colaboradores que aún no se marcaron como recibidos.
      </p>
      <p
        className={cn(
          "numeric-tnum font-mono text-4xl font-medium leading-none",
          t.valor,
        )}
      >
        {conteo}
      </p>
      <Link
        href="/panel/actividades?estado=RECOLECTANDO"
        className={cn(
          "focus-ring group inline-flex items-center gap-1 text-sm font-medium",
          t.enlace,
        )}
      >
        Revisar en actividades activas
        <ArrowRightIcon
          strokeWidth={1.5}
          className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
        />
      </Link>
    </section>
  );
}
