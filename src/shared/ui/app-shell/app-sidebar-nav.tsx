"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BoxesIcon,
  BuildingIcon,
  FilePlus2Icon,
  HandHeartIcon,
  LayoutDashboardIcon,
  LightbulbIcon,
  MapPinnedIcon,
  PackageIcon,
  ScrollTextIcon,
  UserRoundIcon,
  UserCheckIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { IconoNav, NavItem, NavSection } from "./navConfig";

// Mapa nombre → componente de icono. Vive en el client porque los server
// components no pueden pasar funciones (componentes) a los client como prop.
const ICONOS: Record<IconoNav, LucideIcon> = {
  panel: LayoutDashboardIcon,
  actividades: PackageIcon,
  solicitudes: ScrollTextIcon,
  recursos: BoxesIcon,
  acopio: BuildingIcon,
  puntos: MapPinnedIcon,
  perfil: UserRoundIcon,
  aportes: HandHeartIcon,
  nuevaSolicitud: FilePlus2Icon,
  proponer: LightbulbIcon,
  aprobaciones: UserCheckIcon,
};

type Props = {
  sections: NavSection[];
  onNavigate?: () => void;
};

function esActivo(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Navegación interna del sidebar (feature 021, generalizada desde el panel de
 * admin 008). Cada ítem activo lleva:
 *  - Un borde izquierdo ocre de 2px (identidad del panel de despacho).
 *  - Fondo ocre muy tenue (bg-primary/10) para reforzar sin saturar.
 *  - Texto primary-ink con peso medium.
 * Los inactivos usan el sweep teal en hover, coherente con el navbar global.
 */
export function AppSidebarNav({ sections, onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación del panel" className="flex flex-col gap-6">
      {sections.map((section) => (
        <div key={section.label} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-xs font-semibold text-foreground/80">
            {section.label}
          </p>
          {section.items.map((item) => {
            const activo = esActivo(pathname, item);
            const Icon = ICONOS[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={activo ? "page" : undefined}
                onClick={onNavigate}
                className={cn(
                  "focus-ring group inline-flex items-center gap-3 rounded-md border-l-2 py-2 pr-3 pl-[calc(0.75rem-2px)] text-sm transition-colors duration-150",
                  activo
                    ? "border-primary bg-primary/10 font-medium text-primary-ink"
                    : "border-transparent text-foreground/75 hover:bg-muted/50 hover:text-accent",
                )}
              >
                <Icon
                  strokeWidth={1.5}
                  className={cn(
                    "size-4 shrink-0 transition-colors duration-150",
                    activo
                      ? "text-primary-ink"
                      : "text-foreground/50 group-hover:text-accent",
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
