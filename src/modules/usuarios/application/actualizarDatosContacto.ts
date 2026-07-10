import {
  validarDatosContacto,
  type DatosContacto,
} from "@/modules/usuarios/domain/datosContacto";
import { Rol } from "@/modules/usuarios/domain/Rol";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import type { UsuarioRepository } from "@/modules/usuarios/domain/UsuarioRepository";
import { validarUbicacionCatalogo } from "@/modules/ubicaciones/domain/reglas";
import type { UbicacionRepository } from "@/modules/ubicaciones/domain/UbicacionRepository";
import {
  CedulaYaRegistradaError,
  DatosContactoInvalidosError,
  UsuarioNoEncontradoError,
} from "./errors";

export type ActualizarDatosContactoDeps = {
  usuarios: UsuarioRepository;
  ubicaciones: Pick<UbicacionRepository, "obtenerMunicipio">;
};

export type ActualizarDatosContactoInput = DatosContacto;

/**
 * Valida y persiste contacto + ubicación por catálogo (017 + 020).
 */
export async function actualizarDatosContacto(
  { usuarios, ubicaciones }: ActualizarDatosContactoDeps,
  usuarioId: string,
  input: ActualizarDatosContactoInput,
): Promise<Usuario> {
  const usuario = await usuarios.buscarPorId(usuarioId);
  if (!usuario) {
    throw new UsuarioNoEncontradoError(usuarioId);
  }
  if (usuario.rol !== Rol.COLABORADOR && usuario.rol !== Rol.SOLICITANTE) {
    throw new DatosContactoInvalidosError(
      "Este perfil no puede editarse desde aquí.",
    );
  }

  const validacion = validarDatosContacto(input);
  if (!validacion.ok) {
    throw new DatosContactoInvalidosError(validacion.error);
  }

  const ubicacion = await validarUbicacionCatalogo(
    {
      estadoId: validacion.valor.estadoId,
      municipioId: validacion.valor.municipioId,
    },
    { ubicaciones },
  );
  if (!ubicacion.ok) {
    throw new DatosContactoInvalidosError(ubicacion.error);
  }

  const existente = await usuarios.buscarPorCedula(validacion.valor.cedula);
  if (existente && existente.id !== usuarioId) {
    throw new CedulaYaRegistradaError();
  }

  return usuarios.actualizarDatosContacto(usuarioId, {
    ...validacion.valor,
    estadoId: ubicacion.valor.estadoId,
    municipioId: ubicacion.valor.municipioId,
  });
}
