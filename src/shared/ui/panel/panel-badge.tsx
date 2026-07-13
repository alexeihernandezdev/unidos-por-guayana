import { cn } from "@/shared/lib/utils";

// Pill de estado para las row-cards (feature 026, guía
// `constitution/ui-guidelines.md §5`). Unifica el badge de estado que cada
// listado dibujaba a mano (activo = teal de marca, neutro = muted).

export type PanelBadgeTone = "active" | "neutral" | "warning" | "danger";

const TONE: Record<PanelBadgeTone, string> = {
  active: "bg-primary/10 text-primary-ink",
  neutral: "bg-muted text-muted-foreground",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-destructive/10 text-destructive",
};

type Props = {
  tone?: PanelBadgeTone;
  children: React.ReactNode;
  className?: string;
};

export function PanelBadge({ tone = "neutral", children, className }: Props) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
