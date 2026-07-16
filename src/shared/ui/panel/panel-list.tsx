import { cn } from "@/shared/lib/utils";

// Listado de datos como lista de row-cards (estándar Puntos de acopio). Feature
// 026, guía `constitution/ui-guidelines.md §5`.
//   - `PanelListToolbar`: barra-resumen superior (conteo/resumen + acción primaria).
//   - `PanelList`: contenedor `divide-y` de las filas (`PanelListRow`).

type ToolbarProps = {
  /** Texto de conteo/resumen ("N puntos en total"). */
  resumen?: React.ReactNode;
  /** Acción(es) primaria(s) a la derecha (normalmente un `<Button>`). */
  children?: React.ReactNode;
  className?: string;
};

export function PanelListToolbar({
  resumen,
  children,
  className,
}: ToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4",
        className,
      )}
    >
      {resumen != null && (
        <div className="text-sm text-muted-foreground">{resumen}</div>
      )}
      {children}
    </div>
  );
}

type ListProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * Entrada en cascada de las filas al montar (clase `.panel-stagger`, gated por
   * `prefers-reduced-motion`). Opt-in; por defecto no anima para no cambiar el
   * comportamiento existente del panel admin.
   */
  animated?: boolean;
};

export function PanelList({ children, className, animated = false }: ListProps) {
  return (
    <div
      className={cn(
        "divide-y overflow-hidden rounded-lg border bg-card",
        animated && "panel-stagger",
        className,
      )}
    >
      {children}
    </div>
  );
}
