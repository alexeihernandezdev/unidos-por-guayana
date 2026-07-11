import { EstadoVerificacion, Rol } from "./Rol";
import type { Usuario } from "./Usuario";

// Reglas de dominio (puras) para la verificación de cuentas de administrador que
// introdujo la feature 015. Son el único punto de verdad que consumen los casos
// de uso (aprobar/rechazar admin) y el enforcement de servidor.

// Transiciones válidas del `estadoVerificacion`. Solo una cuenta en `PENDIENTE`
// puede resolverse hacia `VERIFICADO` o `RECHAZADO`; los estados resueltos son
// terminales (no se re-aprueba lo aprobado ni se reabre lo rechazado).
const TRANSICIONES_VERIFICACION: Record<
  EstadoVerificacion,
  readonly EstadoVerificacion[]
> = {
  [EstadoVerificacion.PENDIENTE]: [
    EstadoVerificacion.VERIFICADO,
    EstadoVerificacion.RECHAZADO,
  ],
  [EstadoVerificacion.VERIFICADO]: [],
  [EstadoVerificacion.RECHAZADO]: [],
};

/** ¿Es válido pasar `estadoVerificacion` de `desde` a `hacia`? */
export function esTransicionVerificacionValida(
  desde: EstadoVerificacion,
  hacia: EstadoVerificacion,
): boolean {
  return TRANSICIONES_VERIFICACION[desde].includes(hacia);
}

/**
 * Predicado de operatividad del administrador y punto único de verdad para el
 * enforcement: un `ADMIN` solo opera (crea/gestiona Actividades, recursos, aportes…)
 * cuando su cuenta está `VERIFICADO`. Un `ADMIN` en `PENDIENTE` o `RECHAZADO`
 * queda bloqueado. Ningún otro rol opera como administrador.
 */
export function puedeOperarComoAdmin(
  usuario: Pick<Usuario, "rol" | "estadoVerificacion">,
): boolean {
  return (
    usuario.rol === Rol.ADMIN &&
    usuario.estadoVerificacion === EstadoVerificacion.VERIFICADO
  );
}
