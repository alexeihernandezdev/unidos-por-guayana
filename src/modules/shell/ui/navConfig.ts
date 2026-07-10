import { Rol } from "@/modules/usuarios/domain/Rol";
import { panelInicioPorRol } from "@/modules/shell/domain/panelInicio";

export type IconoNav =
  | "panel"
  | "envios"
  | "solicitudes"
  | "recursos"
  | "perfil"
  | "aportes"
  | "nueva"
  | "aprobaciones";

export type ShellNavItem = {
  label: string;
  href: string;
  icon: IconoNav;
  exact?: boolean;
};

export type ShellNavSection = {
  label: string;
  items: ShellNavItem[];
};

export function navSectionsPorRol(rol: Rol): ShellNavSection[] {
  switch (rol) {
    case Rol.SUPERADMIN:
      return [
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
    case Rol.COLABORADOR:
      return [
        {
          label: "Aportar",
          items: [
            {
              label: "Actividades",
              href: "/ayudas",
              icon: "envios",
              exact: true,
            },
            {
              label: "Mis aportes",
              href: "/mis-aportes",
              icon: "aportes",
              exact: true,
            },
          ],
        },
        {
          label: "Mi cuenta",
          items: [
            {
              label: "Mi perfil",
              href: "/mi-perfil",
              icon: "perfil",
              exact: true,
            },
          ],
        },
      ];
    case Rol.SOLICITANTE:
      return [
        {
          label: "Solicitudes",
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
              icon: "nueva",
            },
            {
              label: "Proponer recurso",
              href: "/solicitudes/proponer-recurso",
              icon: "recursos",
            },
          ],
        },
        {
          label: "Mi cuenta",
          items: [
            {
              label: "Mi perfil",
              href: "/mi-perfil",
              icon: "perfil",
              exact: true,
            },
          ],
        },
      ];
    case Rol.ADMIN:
      return [
        {
          label: "Mi cuenta",
          items: [
            {
              label: "Estado de cuenta",
              href: "/cuenta-admin",
              icon: "perfil",
              exact: true,
            },
          ],
        },
      ];
  }
}

export function inicioPanelPorRol(rol: Rol): string {
  return panelInicioPorRol(rol);
}
