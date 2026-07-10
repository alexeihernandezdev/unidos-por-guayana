import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

type Props = {
  conteo: number;
};

export function BloqueAportesPendientes({ conteo }: Props) {
  return (
    <section
      aria-labelledby="titulo-aportes-pendientes"
      className="flex flex-col gap-3 rounded-lg border border-border p-5"
    >
      <h2
        id="titulo-aportes-pendientes"
        className="font-serif text-lg leading-none tracking-tight"
      >
        Aportes por confirmar
      </h2>
      <p className="text-sm text-foreground/70">
        Compromisos de colaboradores que aún no se marcaron como recibidos.
      </p>
      <p className="numeric-tnum font-mono text-4xl font-medium text-foreground">
        {conteo}
      </p>
      <Link
        href="/panel/ayudas?estado=RECOLECTANDO"
        className="focus-ring group inline-flex items-center gap-1 text-sm text-accent"
      >
        Revisar en envíos activos
        <ArrowRightIcon
          strokeWidth={1.5}
          className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
        />
      </Link>
    </section>
  );
}
