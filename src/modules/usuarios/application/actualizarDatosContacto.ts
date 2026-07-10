import {
  validarDatosContacto,
  type DatosContacto,
} from "@/modules/usuarios/domain/datosContacto";
import { Rol } from "@/modules/usuarios/domain/Rol";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import type { UsuarioRepository } from "@/modules/usuarios/domain/UsuarioRepository";
import { validarUbicacionCatalogo } from "@/modules/ubicacion/application/validarUbicacionCatalogo";
import type { UbicacionRepository } from "@/modules/ubicacion/domain/UbicacionRepository";
import {
  CedulaYaRegistradaError,
  DatosContactoInvalidosError,
  UsuarioNoEncontradoError,
} from "./errors";

export type ActualizarDatosContactoDeps = {
  usuarios: UsuarioRepository;
  ubicacion: UbicacionRepository;
};

export type ActualizarDatosContactoInput = DatosContacto;

export async function actualizarDatosContacto(
  { usuarios, ubicacion }: ActualizarDatosContactoDeps,
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

  try {
    await validarUbicacionCatalogo({ ubicacion }, {
      estadoId: validacion.valor.estadoId,
      municipioId: validacion.valor.municipioId,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new DatosContactoInvalidosError(error.message);
    }
    throw error;
  }

  const existente = await usuarios.buscarPorCedula(validacion.valor.cedula);
  if (existente && existente.id !== usuarioId) {
    throw new CedulaYaRegistradaError();
  }

  return usuarios.actualizarDatosContacto(usuarioId, validacion.valor);
}
