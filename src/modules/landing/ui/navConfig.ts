import { Rol } from "@/modules/usuarios/domain/Rol";

// Elemento de navegación principal (visible en el navbar). `exact` fuerza que el
// marcador activo solo se encienda con la ruta exacta (útil para "Panel" que
// convive con /panel/ayudas, /panel/recursos, etc.).
export type NavItem = {
  label: string;
  href: string;
  exact?: boolean;
};

/**
 * Devuelve los destinos del navbar principal según el rol del usuario. Sin sesión
 * o rol no reconocido: sin ítems (el navbar solo muestra wordmark + CTAs de auth).
 *
 * La sección pública mantiene la landing como discovery: no se listan anclas
 * (#envios, #como-funciona…) porque el navbar es global y rompen fuera de `/`.
 */
export function navItemsPorRol(rol: Rol | null): NavItem[] {
  if (!rol) return [];
  switch (rol) {
    case Rol.SUPERADMIN:
      return [
        { label: "Aprobaciones", href: "/superadmin/admins", exact: true },
      ];
    case Rol.ADMIN:
      return [
        { label: "Panel", href: "/panel", exact: true },
        { label: "Envíos", href: "/panel/ayudas" },
        { label: "Recursos", href: "/panel/recursos" },
        { label: "Solicitudes", href: "/panel/solicitudes" },
      ];
    case Rol.COLABORADOR:
      return [
        { label: "Envíos", href: "/ayudas", exact: true },
        { label: "Mis aportes", href: "/mis-aportes", exact: true },
      ];
    case Rol.SOLICITANTE:
      return [
        { label: "Mis solicitudes", href: "/solicitudes", exact: true },
        { label: "Nueva solicitud", href: "/solicitudes/nueva", exact: true },
      ];
  }
}

// Etiqueta legible del rol para el chip de identidad.
export const ROL_ETIQUETA: Record<Rol, string> = {
  [Rol.SUPERADMIN]: "Superadministrador",
  [Rol.ADMIN]: "Administrador",
  [Rol.COLABORADOR]: "Colaborador",
  [Rol.SOLICITANTE]: "Solicitante",
};

// Color del dot del chip por rol. Ocre = identidad (SUPERADMIN raíz de confianza
// y ADMIN, la voz gestora); teal Orinoco = capa de soporte (COLABORADOR, quien
// aporta); neutro para SOLICITANTE. Coherente con la "disciplina de acentos" de
// tech-stack.md. El SUPERADMIN refuerza la marca con el mismo ocre del ADMIN.
export const ROL_DOT: Record<Rol, string> = {
  [Rol.SUPERADMIN]: "bg-primary",
  [Rol.ADMIN]: "bg-primary",
  [Rol.COLABORADOR]: "bg-accent",
  [Rol.SOLICITANTE]: "bg-foreground/40",
};
