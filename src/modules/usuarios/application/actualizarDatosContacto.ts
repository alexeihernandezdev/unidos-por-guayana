import {
  validarDatosContacto,
  type DatosContacto,
} from "@/modules/usuarios/domain/datosContacto";
import { Rol } from "@/modules/usuarios/domain/Rol";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import type { UsuarioRepository } from "@/modules/usuarios/domain/UsuarioRepository";
import {
  CedulaYaRegistradaError,
  DatosContactoInvalidosError,
  UsuarioNoEncontradoError,
} from "./errors";

export type ActualizarDatosContactoDeps = {
  usuarios: UsuarioRepository;
};

export type ActualizarDatosContactoInput = DatosContacto;

/**
 * Valida y persiste los cinco campos de contacto/ubicación de un usuario. Se
 * usa tanto en el primer inicio de sesión (guard → `/completar-perfil`) como
 * en la edición desde `/mi-perfil` (feature 017).
 *
 * Reglas:
 * - Solo `COLABORADOR` y `SOLICITANTE` guardan estos datos en `Usuario`; para
 *   `ADMIN` los datos viven en `PerfilAdmin` (016) y este caso de uso no aplica.
 * - Unicidad de cédula: rechaza si otra cuenta ya la tiene, permitiendo que el
 *   propio usuario "guarde sin cambiar" (cédula igual a la suya actual).
 */
export async function actualizarDatosContacto(
  { usuarios }: ActualizarDatosContactoDeps,
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

  const existente = await usuarios.buscarPorCedula(validacion.valor.cedula);
  if (existente && existente.id !== usuarioId) {
    throw new CedulaYaRegistradaError();
  }

  return usuarios.actualizarDatosContacto(usuarioId, validacion.valor);
}
