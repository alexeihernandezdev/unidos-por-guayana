import { panelInicioPorRol } from "@/modules/shell/domain/panelInicio";
import { Rol } from "@/modules/usuarios/domain/Rol";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import { puedeOperarComoAdmin } from "@/modules/usuarios/domain/verificacion";

/**
 * Destino tras login o completar onboarding. Para ADMIN lee el estado de
 * verificación del usuario ya cargado (fresco de base en el login action).
 */
export function resolverPanelInicio(usuario: Usuario): string {
  if (usuario.rol === Rol.ADMIN) {
    return puedeOperarComoAdmin(usuario) ? "/panel" : "/cuenta-admin";
  }
  return panelInicioPorRol(usuario.rol);
}
