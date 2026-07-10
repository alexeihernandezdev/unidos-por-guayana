import { Rol } from "@/modules/usuarios/domain/Rol";

/**
 * Ruta de inicio del panel según rol (sin comprobar verificación de ADMIN).
 * Para ADMIN usa `resolverPanelInicio`, que lee el estado fresco de base.
 */
export function panelInicioPorRol(rol: Rol): string {
  switch (rol) {
    case Rol.SUPERADMIN:
      return "/superadmin/admins";
    case Rol.ADMIN:
      return "/panel";
    case Rol.COLABORADOR:
      return "/ayudas";
    case Rol.SOLICITANTE:
      return "/solicitudes";
  }
}
