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
  /**
   * Entrada "rise" del banner al montar (clase `.panel-rise`, gated por
   * `prefers-reduced-motion`). Opt-in; por defecto no anima para no cambiar el
   * comportamiento del panel admin.
   */
  animated?: boolean;
};

// Estilos de acción sobre el banner (feature 028). El botón primario teal es
// ilegible sobre `bg-primary-ink`; sobre el banner la acción principal invierte
// a blanco y la secundaria usa un wash translúcido con hairline. Se aplican como
// `className` sobre `<Button>` (tailwind-merge resuelve los conflictos).
export const PANEL_HEADER_ACTION = {
  primary:
    "bg-white text-primary-ink hover:bg-white/90 focus-visible:ring-white/40",
  secondary:
    "border border-white/15 bg-white/10 text-primary-foreground hover:bg-white/20 focus-visible:ring-white/40",
} as const;

export function PanelPageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  animated = false,
}: Props) {
  return (
    <header
      className={cn(
        "relative isolate overflow-hidden rounded-xl bg-primary-ink px-6 py-7 text-primary-foreground md:px-8",
        animated && "panel-rise",
      )}
    >
      {/* Capa de profundidad: wash radial dentro del hue del token (superficie,
          no gradient-text) + icono fantasma, misma familia visual que las
          tarjetas del dashboard. Decorativos, fuera del árbol accesible. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_150%_at_0%_0%,color-mix(in_oklch,var(--primary)_45%,transparent),transparent_62%)]"
      />
      <Icon
        aria-hidden="true"
        strokeWidth={1}
        className="pointer-events-none absolute -bottom-9 -right-7 hidden size-44 text-white/[0.07] lg:block"
      />
      <div
        className={cn(
          "relative flex items-start gap-4",
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
