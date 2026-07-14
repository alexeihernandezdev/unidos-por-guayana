import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type Props = {
  titulo: string;
  icono?: LucideIcon;
  /** Nota o control a la derecha del encabezado (rango, enlace, etc.). */
  accion?: ReactNode;
  className?: string;
  children: ReactNode;
};

// Contenedor de un módulo del dashboard: card con hairline, encabezado con ícono en
// chip y una acción opcional. La elevación (card) está justificada aquí porque cada
// módulo es una unidad de información distinta (ver "Sin cards por defecto").
export function TarjetaPanel({
  titulo,
  icono: Icono,
  accion,
  className,
  children,
}: Props) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card p-5",
        className,
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-base font-semibold leading-none tracking-tight">
          {Icono ? (
            <span
              className="grid size-8 flex-none place-items-center rounded-lg bg-primary/10 text-primary-ink"
              aria-hidden
            >
              <Icono strokeWidth={1.5} className="size-4" />
            </span>
          ) : null}
          {titulo}
        </h2>
        {accion ? (
          <div className="flex-none text-xs text-muted-foreground">{accion}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
