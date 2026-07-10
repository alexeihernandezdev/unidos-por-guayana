import {
  problemasDePerfilAdmin,
  type CambiosPerfilAdmin,
  type DatosPerfilAdmin,
  type PerfilAdmin,
} from "@/modules/usuarios/domain/PerfilAdmin";
import type { PerfilAdminRepository } from "@/modules/usuarios/domain/PerfilAdminRepository";
import { validarUbicacionCatalogo } from "@/modules/ubicacion/application/validarUbicacionCatalogo";
import type { UbicacionRepository } from "@/modules/ubicacion/domain/UbicacionRepository";
import {
  PerfilAdminDuplicadoError,
  PerfilAdminInvalidoError,
  PerfilAdminNoEncontradoError,
} from "./errors";

export type PerfilAdminDeps = {
  perfiles: PerfilAdminRepository;
  ubicacion: UbicacionRepository;
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

async function validarUbicacionPerfil(
  ubicacion: UbicacionRepository,
  datos: DatosPerfilAdmin,
): Promise<void> {
  try {
    await validarUbicacionCatalogo({ ubicacion }, {
      estadoId: datos.estadoId,
      municipioId: datos.municipioId,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new PerfilAdminInvalidoError(error.message);
    }
    throw error;
  }
}

export async function crearPerfilAdmin(
  { perfiles, ubicacion }: PerfilAdminDeps,
  input: CrearPerfilAdminInput,
): Promise<PerfilAdmin> {
  const { usuarioId, ...datos } = input;
  const normalizados = normalizar(datos);
  exigirValido(normalizados);
  await validarUbicacionPerfil(ubicacion, normalizados);

  const existente = await perfiles.buscarPorUsuarioId(usuarioId);
  if (existente) {
    throw new PerfilAdminDuplicadoError(usuarioId);
  }

  return perfiles.crear({ usuarioId, ...normalizados });
}

export async function actualizarPerfilAdmin(
  { perfiles, ubicacion }: PerfilAdminDeps,
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
  await validarUbicacionPerfil(ubicacion, combinados);

  return perfiles.actualizar(usuarioId, combinados);
}

export function obtenerPerfilAdmin(
  { perfiles }: PerfilAdminDeps,
  usuarioId: string,
): Promise<PerfilAdmin | null> {
  return perfiles.buscarPorUsuarioId(usuarioId);
}
