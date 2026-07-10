import { EstadoVerificacion, Rol } from "@/modules/usuarios/domain/Rol";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import type { UsuarioRepository } from "@/modules/usuarios/domain/UsuarioRepository";
import { esTransicionVerificacionValida } from "@/modules/usuarios/domain/verificacion";
import {
  CuentaAdminNoAprobableError,
  SoloSuperadminError,
  UsuarioNoEncontradoError,
} from "./errors";

// Casos de uso con los que el `SUPERADMIN` resuelve las cuentas `ADMIN`
// pendientes (feature 015). Puros: solo dependen del dominio (repositorio como
// contrato y reglas de transición). El doble candado —que el actor sea
// `SUPERADMIN` y que la transición sea válida— vive aquí, no solo en la UI.

export type GestionarAdminsDeps = {
  usuarios: UsuarioRepository;
};

// Identidad mínima del actor. La sesión ya trae el rol; se reafirma en el caso
// de uso para que ninguna acción futura se salte la comprobación.
export type Actor = {
  rol: Rol;
};

/** Cuentas `ADMIN` en `PENDIENTE` que el superadmin puede aprobar o rechazar. */
export async function listarAdminsPendientes(
  { usuarios }: GestionarAdminsDeps,
  actor: Actor,
): Promise<Usuario[]> {
  exigirSuperadmin(actor);
  return usuarios.listarAdminsPendientes();
}

/** Aprueba una cuenta `ADMIN` en `PENDIENTE`: pasa a `VERIFICADO`. */
export function aprobarAdmin(
  deps: GestionarAdminsDeps,
  actor: Actor,
  adminId: string,
): Promise<Usuario> {
  return resolverAdmin(deps, actor, adminId, EstadoVerificacion.VERIFICADO);
}

/** Rechaza una cuenta `ADMIN` en `PENDIENTE`: pasa a `RECHAZADO`. */
export function rechazarAdmin(
  deps: GestionarAdminsDeps,
  actor: Actor,
  adminId: string,
): Promise<Usuario> {
  return resolverAdmin(deps, actor, adminId, EstadoVerificacion.RECHAZADO);
}

async function resolverAdmin(
  { usuarios }: GestionarAdminsDeps,
  actor: Actor,
  adminId: string,
  destino: EstadoVerificacion,
): Promise<Usuario> {
  exigirSuperadmin(actor);

  const objetivo = await usuarios.buscarPorId(adminId);
  if (!objetivo) {
    throw new UsuarioNoEncontradoError(adminId);
  }
  if (objetivo.rol !== Rol.ADMIN) {
    throw new CuentaAdminNoAprobableError(
      "Solo se pueden aprobar o rechazar cuentas de administrador.",
    );
  }
  if (!esTransicionVerificacionValida(objetivo.estadoVerificacion, destino)) {
    throw new CuentaAdminNoAprobableError();
  }

  return usuarios.actualizarEstadoVerificacion(objetivo.id, destino);
}

function exigirSuperadmin(actor: Actor): void {
  if (actor.rol !== Rol.SUPERADMIN) {
    throw new SoloSuperadminError();
  }
}
