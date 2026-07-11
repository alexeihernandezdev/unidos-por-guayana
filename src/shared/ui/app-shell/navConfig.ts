import { Rol } from "@/modules/usuarios/domain/Rol";

// Nombres de icono aceptados en el sidebar. Los strings se resuelven a
// componentes de lucide-react DENTRO del client component (`AppSidebarNav`),
// porque los server components no pueden pasar funciones a los client.
export type IconoNav =
  | "panel"
  | "actividades"
  | "solicitudes"
  | "recursos"
  | "acopio"
  | "perfil"
  | "aportes"
  | "nuevaSolicitud"
  | "proponer"
  | "aprobaciones";

// Ítem de navegación del panel. `exact` = activo solo con la ruta exacta.
export type NavItem = {
  label: string;
  href: string;
  icon: IconoNav;
  exact?: boolean;
};

// Agrupación por dominio. La sección se etiqueta con un heading tenue
// (nunca uppercase-tracked, prohibido por tech-stack.md).
export type NavSection = {
  label: string;
  items: NavItem[];
};

// Navegación del panel del ADMIN (feature 008). Se conserva idéntica al mover
// el shell a la capa compartida: mismos destinos, mismas secciones.
const NAV_ADMIN: NavSection[] = [
  {
    label: "Operación",
    items: [
      { label: "Panel", href: "/panel", icon: "panel", exact: true },
      { label: "Actividades", href: "/panel/ayudas", icon: "actividades" },
      { label: "Solicitudes", href: "/panel/solicitudes", icon: "solicitudes" },
    ],
  },
  {
    label: "Catálogo",
    items: [{ label: "Recursos", href: "/panel/recursos", icon: "recursos" }],
  },
  {
    label: "Mi cuenta",
    items: [
      { label: "Mi centro de acopio", href: "/panel/perfil", icon: "acopio" },
    ],
  },
];

// Navegación del SUPERADMIN: raíz de confianza (feature 015). Su única
// operación es la bandeja de aprobación de administradores.
const NAV_SUPERADMIN: NavSection[] = [
  {
    label: "Gestión",
    items: [
      {
        label: "Aprobaciones",
        href: "/superadmin/admins",
        icon: "aprobaciones",
        exact: true,
      },
    ],
  },
];

// Navegación del COLABORADOR. Reutiliza las rutas existentes (features 006/017);
// los destinos coinciden con los del navbar público (`navItemsPorRol`).
const NAV_COLABORADOR: NavSection[] = [
  {
    label: "Operación",
    items: [
      { label: "Actividades", href: "/ayudas", icon: "actividades", exact: true },
      { label: "Mis aportes", href: "/mis-aportes", icon: "aportes", exact: true },
    ],
  },
  {
    label: "Mi cuenta",
    items: [{ label: "Mi perfil", href: "/mi-perfil", icon: "perfil", exact: true }],
  },
];

// Navegación del SOLICITANTE. Reutiliza las rutas existentes (features 007/019).
const NAV_SOLICITANTE: NavSection[] = [
  {
    label: "Operación",
    items: [
      {
        label: "Mis solicitudes",
        href: "/solicitudes",
        icon: "solicitudes",
        exact: true,
      },
      {
        label: "Nueva solicitud",
        href: "/solicitudes/nueva",
        icon: "nuevaSolicitud",
        exact: true,
      },
      {
        label: "Proponer recurso",
        href: "/solicitudes/proponer-recurso",
        icon: "proponer",
        exact: true,
      },
    ],
  },
  {
    label: "Mi cuenta",
    items: [{ label: "Mi perfil", href: "/mi-perfil", icon: "perfil", exact: true }],
  },
];

/**
 * Única fuente de verdad de la navegación del sidebar por rol (feature 021).
 * Todos los roles logeados comparten el mismo shell; solo cambian las
 * secciones. Un rol sin secciones (no debería ocurrir) devuelve `[]`.
 */
export function navSectionsPorRol(rol: Rol): NavSection[] {
  switch (rol) {
    case Rol.ADMIN:
      return NAV_ADMIN;
    case Rol.SUPERADMIN:
      return NAV_SUPERADMIN;
    case Rol.COLABORADOR:
      return NAV_COLABORADOR;
    case Rol.SOLICITANTE:
      return NAV_SOLICITANTE;
  }
}

/**
 * Destino de aterrizaje tras iniciar sesión, por rol (feature 021). Es el
 * "hogar" de cada usuario dentro de su espacio y también el destino del
 * wordmark del sidebar y del enlace "Ir a mi panel" en páginas públicas.
 */
export function rutaInicioPorRol(rol: Rol): string {
  switch (rol) {
    case Rol.ADMIN:
      return "/panel";
    case Rol.SUPERADMIN:
      return "/superadmin/admins";
    case Rol.COLABORADOR:
      return "/ayudas";
    case Rol.SOLICITANTE:
      return "/solicitudes";
  }
}
