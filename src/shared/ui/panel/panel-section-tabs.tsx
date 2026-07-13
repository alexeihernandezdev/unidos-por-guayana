import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

// Sub-navegación de sección (Perfil / Puntos de acopio). Feature 026: extrae el
// `profile-section-link` que estaba duplicado a mano en dos páginas, sin cambiar
// su aspecto. Server component.

export type PanelSectionTab = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type Props = {
  ariaLabel: string;
  items: PanelSectionTab[];
  /** `href` del tab activo. */
  activo: string;
};

export function PanelSectionTabs({ ariaLabel, items, activo }: Props) {
  return (
    <nav
      aria-label={ariaLabel}
      className="flex gap-2 overflow-x-auto border-b pb-3"
    >
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={href === activo ? "page" : undefined}
          className={cn(
            "profile-section-link",
            href === activo && "bg-muted text-foreground",
          )}
        >
          <Icon />
          {label}
        </Link>
      ))}
    </nav>
  );
}
