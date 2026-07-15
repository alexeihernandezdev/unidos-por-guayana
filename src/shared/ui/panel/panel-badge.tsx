import { cn } from "@/shared/lib/utils";

// Pill de estado para las row-cards (feature 026, guía
// `constitution/ui-guidelines.md §5`; tonos semánticos desde la 028). Unifica el
// badge de estado que cada listado dibujaba a mano. Los tonos salen de la paleta
// semántica de `tech-stack.md § Estilo visual` (tokens, nunca hex/ámbar a mano);
// el color siempre acompaña al texto, no lo sustituye.

export type PanelBadgeTone =
  | "active"
  | "neutral"
  | "success"
  | "warning"
  | "danger";

const TONE: Record<PanelBadgeTone, string> = {
  active: "bg-primary/10 text-primary-ink",
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success/15 text-success-ink",
  warning: "bg-warning/15 text-warning-ink",
  danger: "bg-destructive/10 text-destructive",
};

type Props = {
  tone?: PanelBadgeTone;
  /** Punto de estado antes del texto (para pills de ciclo de vida). */
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function PanelBadge({
  tone = "neutral",
  dot = false,
  children,
  className,
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        TONE[tone],
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-current"
        />
      )}
      {children}
    </span>
  );
}
