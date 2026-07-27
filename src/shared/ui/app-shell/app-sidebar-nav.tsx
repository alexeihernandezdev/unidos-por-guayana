"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BoxesIcon,
  BuildingIcon,
  CoinsIcon,
  FilePlus2Icon,
  HandHeartIcon,
  LayoutDashboardIcon,
  LightbulbIcon,
  MapPinnedIcon,
  MessageSquareQuoteIcon,
  PackageIcon,
  ScrollTextIcon,
  ScanSearchIcon,
  Settings2Icon,
  UserRoundIcon,
  UserCheckIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar";
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
  donaciones: CoinsIcon,
  nuevaSolicitud: FilePlus2Icon,
  proponer: LightbulbIcon,
  aprobaciones: UserCheckIcon,
  red: UsersIcon,
  testimonios: MessageSquareQuoteIcon,
  auditoria: ScanSearchIcon,
  ajustes: Settings2Icon,
};

type Props = {
  sections: NavSection[];
};

function esActivo(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Navegación interna del sidebar (feature 021), sobre los primitivos del Sidebar
 * de ShadCN. Cada sección es un `SidebarGroup`; el ítem activo se resalta con
 * `isActive` (usa el `data-active` del componente). En móvil el Sidebar se rinde
 * como Sheet, así que al navegar lo cerramos con `setOpenMobile(false)`.
 */
export function AppSidebarNav({ sections }: Props) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const cerrarEnMovil = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <>
      {sections.map((section) => (
        <SidebarGroup key={section.label}>
          <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map((item) => {
              const activo = esActivo(pathname, item);
              const Icon = ICONOS[item.icon];
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={activo}
                    tooltip={item.label}
                  >
                    <Link
                      href={item.href}
                      aria-current={activo ? "page" : undefined}
                      onClick={cerrarEnMovil}
                    >
                      <Icon strokeWidth={1.5} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
