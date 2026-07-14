import Link from "next/link";
import { ArrowRightIcon, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

type Props = {
  valor: number;
  /** Texto bajo el número (p. ej. "actividades este mes"). */
  etiqueta: string;
  /** Píldora de contexto arriba a la izquierda (p. ej. "Este mes"). */
  etiquetaPill: string;
  /** Variación frente al mes anterior (%), o null si no aplica. */
  deltaPct: number | null;
  /** Totales de los últimos meses para el mini sparkline. */
  serie: number[];
  href: string;
};

// Tarjeta destacada (equivalente al bloque oscuro "Update" del referente),
// recoloreada al teal profundo de marca. Resume el pulso de la operación: el volumen
// del mes, su tendencia reciente y el cambio respecto al mes previo.
export function TarjetaDestacada({
  valor,
  etiqueta,
  etiquetaPill,
  deltaPct,
  serie,
  href,
}: Props) {
  const sube = deltaPct !== null && deltaPct >= 0;
  const TendenciaIcono = sube ? TrendingUp : TrendingDown;
  const maximo = Math.max(1, ...serie);

  return (
    <Link
      href={href}
      className="focus-ring group relative flex flex-col justify-between gap-5 overflow-hidden rounded-xl p-5 text-white transition-transform duration-200 hover:-translate-y-0.5"
      style={{ background: "var(--primary-ink)" }}
    >
      {/* Textura de fondo whisper-quiet. */}
      <Sparkles
        strokeWidth={1.5}
        className="pointer-events-none absolute -right-4 -top-4 size-28 text-white/[0.06] transition-transform duration-300 group-hover:scale-110"
        aria-hidden
      />

      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-0.5 text-xs font-medium">
          <Sparkles strokeWidth={1.5} className="size-3" aria-hidden />
          {etiquetaPill}
        </span>
        {deltaPct !== null ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-xs text-white/90">
            <TendenciaIcono strokeWidth={1.5} className="size-3.5" />
            <span className="numeric-tnum font-mono">
              {sube ? "+" : ""}
              {deltaPct} %
            </span>
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <span className="numeric-tnum font-mono text-4xl font-medium leading-none tracking-tight">
          {valor}
        </span>
        <span className="text-sm text-white/85">{etiqueta}</span>
      </div>

      {/* Mini sparkline: últimos meses. El último mes va a opacidad plena. */}
      {serie.length > 0 ? (
        <div
          className="flex h-8 items-end gap-1"
          aria-hidden
        >
          {serie.map((valorMes, i) => (
            <span
              key={i}
              className="flex-1 rounded-sm bg-white"
              style={{
                height: `${Math.max(8, (valorMes / maximo) * 100)}%`,
                opacity:
                  i === serie.length - 1
                    ? 1
                    : 0.35 + (i / Math.max(1, serie.length - 1)) * 0.35,
              }}
            />
          ))}
        </div>
      ) : null}

      <span className="inline-flex items-center gap-1 text-xs font-medium text-white/90">
        Ver actividades
        <ArrowRightIcon
          strokeWidth={1.5}
          className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
