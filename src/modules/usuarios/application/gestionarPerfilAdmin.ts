import {
  problemasDePerfilAdmin,
  type CambiosPerfilAdmin,
  type DatosPerfilAdmin,
  type PerfilAdmin,
} from "@/modules/usuarios/domain/PerfilAdmin";
import type { PerfilAdminRepository } from "@/modules/usuarios/domain/PerfilAdminRepository";
import { validarUbicacionCatalogo } from "@/modules/ubicaciones/domain/reglas";
import type { UbicacionRepository } from "@/modules/ubicaciones/domain/UbicacionRepository";
import {
  PerfilAdminDuplicadoError,
  PerfilAdminInvalidoError,
  PerfilAdminNoEncontradoError,
} from "./errors";

export type PerfilAdminDeps = {
  perfiles: PerfilAdminRepository;
  ubicaciones: Pick<UbicacionRepository, "obtenerMunicipio">;
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

async function exigirUbicacionCatalogo(
  datos: DatosPerfilAdmin,
  ubicaciones: Pick<UbicacionRepository, "obtenerMunicipio">,
): Promise<DatosPerfilAdmin> {
  const ubicacion = await validarUbicacionCatalogo(
    { estadoId: datos.estadoId, municipioId: datos.municipioId },
    { ubicaciones },
  );
  if (!ubicacion.ok) {
    throw new PerfilAdminInvalidoError(ubicacion.error);
  }
  return {
    ...datos,
    estadoId: ubicacion.valor.estadoId,
    municipioId: ubicacion.valor.municipioId,
  };
}

export async function crearPerfilAdmin(
  { perfiles, ubicaciones }: PerfilAdminDeps,
  input: CrearPerfilAdminInput,
): Promise<PerfilAdmin> {
  const { usuarioId, ...datos } = input;
  let normalizados = normalizar(datos);
  exigirValido(normalizados);
  normalizados = await exigirUbicacionCatalogo(normalizados, ubicaciones);

  const existente = await perfiles.buscarPorUsuarioId(usuarioId);
  if (existente) {
    throw new PerfilAdminDuplicadoError(usuarioId);
  }

  return perfiles.crear({ usuarioId, ...normalizados });
}

export async function actualizarPerfilAdmin(
  { perfiles, ubicaciones }: PerfilAdminDeps,
  usuarioId: string,
  cambios: CambiosPerfilAdmin,
): Promise<PerfilAdmin> {
  const actual = await perfiles.buscarPorUsuarioId(usuarioId);
  if (!actual) {
    throw new PerfilAdminNoEncontradoError(usuarioId);
  }

  let combinados: DatosPerfilAdmin = normalizar({
    nombreCuenta: cambios.nombreCuenta ?? actual.nombreCuenta,
    estadoId: cambios.estadoId ?? actual.estadoId ?? "",
    municipioId: cambios.municipioId ?? actual.municipioId ?? "",
    telefono: cambios.telefono ?? actual.telefono,
    telefonoEsWhatsApp: cambios.telefonoEsWhatsApp ?? actual.telefonoEsWhatsApp,
    correo: cambios.correo ?? actual.correo,
    tipoDocumento: cambios.tipoDocumento ?? actual.tipoDocumento,
    numeroDocumento: cambios.numeroDocumento ?? actual.numeroDocumento,
  });
  exigirValido(combinados);
  combinados = await exigirUbicacionCatalogo(combinados, ubicaciones);

  return perfiles.actualizar(usuarioId, combinados);
}

export function obtenerPerfilAdmin(
  { perfiles }: Pick<PerfilAdminDeps, "perfiles">,
  usuarioId: string,
): Promise<PerfilAdmin | null> {
  return perfiles.buscarPorUsuarioId(usuarioId);
}
