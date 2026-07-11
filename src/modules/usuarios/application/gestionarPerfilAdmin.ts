import type { CatalogoUbicacionRepository } from "@/modules/ubicacion/domain/CatalogoUbicacionRepository";
import { validarUbicacion } from "@/modules/ubicacion/domain/validarUbicacion";
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
// Puros: solo dependen del dominio (repositorio y catálogo como contratos, y
// reglas de validación). Normalizan (trim) y aplican las reglas antes de
// persistir. La ubicación se valida contra el catálogo (feature 020).

export type PerfilAdminDeps = {
  perfiles: PerfilAdminRepository;
  // Catálogo de ubicación (feature 020): coherencia estado↔municipio del perfil.
  catalogo: CatalogoUbicacionRepository;
};

export type CrearPerfilAdminInput = DatosPerfilAdmin & { usuarioId: string };

function normalizar(datos: DatosPerfilAdmin): DatosPerfilAdmin {
  return {
    nombreCuenta: datos.nombreCuenta.trim(),
    estadoId: datos.estadoId.trim(),
    municipioId: datos.municipioId.trim(),
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

// Valida la coherencia estado↔municipio del perfil contra el catálogo (020).
async function exigirUbicacionCoherente(
  datos: DatosPerfilAdmin,
  catalogo: CatalogoUbicacionRepository,
): Promise<void> {
  const ubicacion = await validarUbicacion(
    { estadoId: datos.estadoId, municipioId: datos.municipioId },
    catalogo,
  );
  if (!ubicacion.ok) {
    throw new PerfilAdminInvalidoError(ubicacion.error);
  }
}

/**
 * Crea el perfil de un `ADMIN`: valida los datos, evita un segundo perfil para la
 * misma cuenta y persiste. Lo invoca el registro público de admin (feature 015).
 */
export async function crearPerfilAdmin(
  { perfiles, catalogo }: PerfilAdminDeps,
  input: CrearPerfilAdminInput,
): Promise<PerfilAdmin> {
  const { usuarioId, ...datos } = input;
  const normalizados = normalizar(datos);
  exigirValido(normalizados);
  await exigirUbicacionCoherente(normalizados, catalogo);

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
  { perfiles, catalogo }: PerfilAdminDeps,
  usuarioId: string,
  cambios: CambiosPerfilAdmin,
): Promise<PerfilAdmin> {
  const actual = await perfiles.buscarPorUsuarioId(usuarioId);
  if (!actual) {
    throw new PerfilAdminNoEncontradoError(usuarioId);
  }

  const combinados: DatosPerfilAdmin = normalizar({
    nombreCuenta: cambios.nombreCuenta ?? actual.nombreCuenta,
    estadoId: cambios.estadoId ?? actual.estadoId,
    municipioId: cambios.municipioId ?? actual.municipioId,
    telefono: cambios.telefono ?? actual.telefono,
    telefonoEsWhatsApp: cambios.telefonoEsWhatsApp ?? actual.telefonoEsWhatsApp,
    correo: cambios.correo ?? actual.correo,
    tipoDocumento: cambios.tipoDocumento ?? actual.tipoDocumento,
    numeroDocumento: cambios.numeroDocumento ?? actual.numeroDocumento,
  });
  exigirValido(combinados);
  await exigirUbicacionCoherente(combinados, catalogo);

  return perfiles.actualizar(usuarioId, combinados);
}

/** Devuelve el perfil de una cuenta, o `null` si no tiene. */
export function obtenerPerfilAdmin(
  { perfiles }: PerfilAdminDeps,
  usuarioId: string,
): Promise<PerfilAdmin | null> {
  return perfiles.buscarPorUsuarioId(usuarioId);
}
