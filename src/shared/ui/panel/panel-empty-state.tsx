import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Estado vacío de un listado (feature 026, guía
// `constitution/ui-guidelines.md §5`). Icono en chip + copy + CTA opcional.
// Unifica los empty-states dispares de cada listado.

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Con borde superior cuando va dentro de un contenedor de listado. */
  bordered?: boolean;
  className?: string;
};

export function PanelEmptyState({
  icon: Icon,
  title,
  description,
  action,
  bordered = true,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 py-16 text-center",
        bordered && "border-t border-border",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-lg bg-muted">
        <Icon
          strokeWidth={1.5}
          className="size-6 text-muted-foreground"
          aria-hidden="true"
        />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="mx-auto max-w-[42ch] text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
