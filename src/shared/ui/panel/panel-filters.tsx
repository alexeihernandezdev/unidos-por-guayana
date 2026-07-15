import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

// Barra de filtros GET de los índices del espacio logeado (feature 028, guía
// `constitution/ui-guidelines.md § Filtros de listado`). Server component:
// `<form method="get">` sobre superficie `bg-card`, coherente con
// `PanelListToolbar`. Sustituye a los formularios de filtro ad-hoc con
// `border-t` y clases duplicadas que tenía cada página.

type FiltersProps = {
  /** Campos del filtro (`<PanelFiltersField>` × N). */
  children: React.ReactNode;
  /** Cuántos filtros están activos; con > 0 se ofrece "Limpiar". */
  activos?: number;
  /** Ruta del índice sin filtros, destino de "Limpiar". */
  limpiarHref?: string;
  submitLabel?: string;
  className?: string;
};

export function PanelFilters({
  children,
  activos = 0,
  limpiarHref,
  submitLabel = "Aplicar",
  className,
}: FiltersProps) {
  return (
    <form
      method="get"
      className={cn(
        "flex flex-wrap items-end gap-x-3 gap-y-4 rounded-lg border bg-card p-4",
        className,
      )}
    >
      {children}
      <div className="flex items-center gap-1.5">
        <Button type="submit" variant="outline">
          {submitLabel}
        </Button>
        {limpiarHref && activos > 0 && (
          <Button asChild variant="ghost" className="text-muted-foreground">
            <Link href={limpiarHref}>Limpiar</Link>
          </Button>
        )}
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  /**
   * `id` del control asociado. Sin `htmlFor` la etiqueta rinde como `<span>`
   * (los Select de Radix ya llevan su propio `aria-label`).
   */
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
};

export function PanelFiltersField({
  label,
  htmlFor,
  children,
  className,
}: FieldProps) {
  const etiqueta = "text-xs font-medium text-muted-foreground";
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={etiqueta}>
          {label}
        </label>
      ) : (
        <span className={etiqueta}>{label}</span>
      )}
      {children}
    </div>
  );
}
