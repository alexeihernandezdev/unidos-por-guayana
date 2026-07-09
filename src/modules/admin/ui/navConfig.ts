// Nombres de icono aceptados en el sidebar. Los strings se resuelven a
// componentes de lucide-react DENTRO del client component (`SidebarNav`),
// porque los server components no pueden pasar funciones a los client.
export type IconoNav =
  | "panel"
  | "envios"
  | "solicitudes"
  | "recursos";

// Ítem de navegación del panel. `exact` = activo solo con la ruta exacta.
export type AdminNavItem = {
  label: string;
  href: string;
  icon: IconoNav;
  exact?: boolean;
};

// Agrupación por dominio. La sección se etiqueta con un heading serif italic
// muy tenue (nunca uppercase-tracked, prohibido por tech-stack.md).
export type AdminNavSection = {
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavSection[] = [
  {
    label: "Operación",
    items: [
      { label: "Panel", href: "/panel", icon: "panel", exact: true },
      { label: "Envíos", href: "/panel/ayudas", icon: "envios" },
      { label: "Solicitudes", href: "/panel/solicitudes", icon: "solicitudes" },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { label: "Recursos", href: "/panel/recursos", icon: "recursos" },
    ],
  },
];
