import {
  problemasDePerfilAdmin,
  type CambiosPerfilAdmin,
  type DatosPerfilAdmin,
  type PerfilAdmin,
} from "@/modules/usuarios/domain/PerfilAdmin";
import type { PerfilAdminRepository } from "@/modules/usuarios/domain/PerfilAdminRepository";
import {
  PerfilAdminDuplicadoError,
  PerfilAdminInvalidoError,
  PerfilAdminNoEncontradoError,
} from "./errors";

// Casos de uso del perfil de administrador / centro de acopio (feature 016).
// Puros: solo dependen del dominio (repositorio como contrato y reglas de
// validación). Normalizan (trim) y aplican las reglas antes de persistir.

export type PerfilAdminDeps = {
  perfiles: PerfilAdminRepository;
};

export type CrearPerfilAdminInput = DatosPerfilAdmin & { usuarioId: string };

function normalizar(datos: DatosPerfilAdmin): DatosPerfilAdmin {
  return {
    nombreCuenta: datos.nombreCuenta.trim(),
    estado: datos.estado.trim(),
    parroquia: datos.parroquia.trim(),
    telefono: datos.telefono.trim(),
    telefonoEsWhatsApp: Boolean(datos.telefonoEsWhatsApp),
    correo: datos.correo.trim().toLowerCase(),
    tipoDocumento: datos.tipoDocumento,
    numeroDocumento: datos.numeroDocumento.trim(),
  };
}

function exigirValido(datos: DatosPerfilAdmin): void {
  const problemas = problemasDePerfilAdmin(datos);
  if (problemas.length > 0) {
    throw new PerfilAdminInvalidoError(problemas[0]);
  }
}

/**
 * Crea el perfil de un `ADMIN`: valida los datos, evita un segundo perfil para la
 * misma cuenta y persiste. Lo invoca el registro público de admin (feature 015).
 */
export async function crearPerfilAdmin(
  { perfiles }: PerfilAdminDeps,
  input: CrearPerfilAdminInput,
): Promise<PerfilAdmin> {
  const { usuarioId, ...datos } = input;
  const normalizados = normalizar(datos);
  exigirValido(normalizados);

  const existente = await perfiles.buscarPorUsuarioId(usuarioId);
  if (existente) {
    throw new PerfilAdminDuplicadoError(usuarioId);
  }

  return perfiles.crear({ usuarioId, ...normalizados });
}

/**
 * Actualiza el perfil de un `ADMIN` aprobado: aplica los cambios sobre el perfil
 * existente y valida el resultado completo antes de persistir.
 */
export async function actualizarPerfilAdmin(
  { perfiles }: PerfilAdminDeps,
  usuarioId: string,
  cambios: CambiosPerfilAdmin,
): Promise<PerfilAdmin> {
  const actual = await perfiles.buscarPorUsuarioId(usuarioId);
  if (!actual) {
    throw new PerfilAdminNoEncontradoError(usuarioId);
  }

  const combinados: DatosPerfilAdmin = normalizar({
    nombreCuenta: cambios.nombreCuenta ?? actual.nombreCuenta,
    estado: cambios.estado ?? actual.estado,
    parroquia: cambios.parroquia ?? actual.parroquia,
    telefono: cambios.telefono ?? actual.telefono,
    telefonoEsWhatsApp: cambios.telefonoEsWhatsApp ?? actual.telefonoEsWhatsApp,
    correo: cambios.correo ?? actual.correo,
    tipoDocumento: cambios.tipoDocumento ?? actual.tipoDocumento,
    numeroDocumento: cambios.numeroDocumento ?? actual.numeroDocumento,
  });
  exigirValido(combinados);

  return perfiles.actualizar(usuarioId, combinados);
}

/** Devuelve el perfil de una cuenta, o `null` si no tiene. */
export function obtenerPerfilAdmin(
  { perfiles }: PerfilAdminDeps,
  usuarioId: string,
): Promise<PerfilAdmin | null> {
  return perfiles.buscarPorUsuarioId(usuarioId);
}
