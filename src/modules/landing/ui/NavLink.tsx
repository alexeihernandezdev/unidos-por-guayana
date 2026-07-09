"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
  className?: string;
  onNavigate?: () => void;
};

/**
 * Link de navegación con estado activo. Usa `usePathname` (client) porque
 * Next 16 no expone la ruta actual en server components. El link inactivo lleva
 * `.underline-sweep` (barrido teal en hover). El activo pinta un marcador ocre
 * bajo el texto, sin animar layout (posición absoluta).
 */
export function NavLink({
  href,
  children,
  exact = false,
  className,
  onNavigate,
}: Props) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "focus-ring inline-flex items-center text-sm leading-none transition-colors duration-150",
        isActive
          ? "font-medium text-primary-ink"
          : "underline-sweep text-foreground/75 hover:text-accent",
        className,
      )}
    >
      <span className="relative py-1">
        {children}
        {isActive && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-[2px] bg-primary"
          />
        )}
      </span>
    </Link>
  );
}
