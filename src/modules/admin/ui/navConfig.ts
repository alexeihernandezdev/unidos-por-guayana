import type {
  IconoNav,
  ShellNavItem,
  ShellNavSection,
} from "@/modules/shell/ui/navConfig";

export type { IconoNav };
export type AdminNavItem = ShellNavItem;
export type AdminNavSection = ShellNavSection;

export const ADMIN_NAV: AdminNavSection[] = [
  {
    label: "Operación",
    items: [
      { label: "Panel", href: "/panel", icon: "panel", exact: true },
      { label: "Actividades", href: "/panel/ayudas", icon: "envios" },
      { label: "Solicitudes", href: "/panel/solicitudes", icon: "solicitudes" },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { label: "Recursos", href: "/panel/recursos", icon: "recursos" },
    ],
  },
  {
    label: "Mi cuenta",
    items: [
      { label: "Mi centro de acopio", href: "/panel/perfil", icon: "perfil" },
    ],
  },
];
