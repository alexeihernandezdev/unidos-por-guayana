type Props = {
  porcentaje: number;
  etiqueta?: string;
  className?: string;
};

function anchoBarra(porcentaje: number): number {
  if (!Number.isFinite(porcentaje) || porcentaje < 0) return 0;
  return Math.min(100, Math.round(porcentaje));
}

export function BarraProgreso({
  porcentaje,
  etiqueta,
  className = "",
}: Props) {
  const ancho = anchoBarra(porcentaje);
  const texto =
    etiqueta ?? `${new Intl.NumberFormat("es-VE", { maximumFractionDigits: 0 }).format(porcentaje)} %`;

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={ancho}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={texto}
      >
        <div
          className="h-full bg-accent motion-reduce:transition-none transition-[width] duration-500 [transition-timing-function:var(--ease-out-emil)]"
          style={{ width: `${ancho}%` }}
        />
      </div>
      <span className="numeric-tnum shrink-0 font-mono text-xs text-foreground/70">
        {texto}
      </span>
    </div>
  );
}
