import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Encabezado banner de las páginas índice del espacio logeado (feature 026,
// guía `constitution/ui-guidelines.md §3`). Derivado del banner de Puntos de
// acopio / Mi perfil. Server component puro (sin estado). Fija familia `font-sans`
// en título y descripción para que no pueda divergir a mano.

type Props = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PanelPageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
}: Props) {
  return (
    <header className="rounded-xl bg-primary-ink px-6 py-7 text-primary-foreground md:px-8">
      <div
        className={cn(
          "flex items-start gap-4",
          actions && "md:items-center md:justify-between",
        )}
      >
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white/10">
            <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="mb-1 text-sm text-white/70">{eyebrow}</p>
            <h1 className="font-sans text-2xl font-semibold tracking-tight md:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}
