import {
  validarDatosContacto,
  type DatosContacto,
} from "@/modules/usuarios/domain/datosContacto";
import type { PasswordHasher } from "@/modules/usuarios/domain/PasswordHasher";
import {
  esRolAutoRegistrable,
  Rol,
  type Rol as RolType,
} from "@/modules/usuarios/domain/Rol";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import type { UsuarioRepository } from "@/modules/usuarios/domain/UsuarioRepository";
import { validarUbicacionCatalogo } from "@/modules/ubicaciones/domain/reglas";
import type { UbicacionRepository } from "@/modules/ubicaciones/domain/UbicacionRepository";
import {
  CedulaYaRegistradaError,
  DatosContactoInvalidosError,
  EmailYaRegistradoError,
  RolNoAutoRegistrableError,
} from "./errors";

export type RegistrarUsuarioDeps = {
  usuarios: UsuarioRepository;
  hasher: PasswordHasher;
  ubicaciones: Pick<UbicacionRepository, "obtenerMunicipio">;
};

export type RegistrarUsuarioInput = {
  nombre: string;
  email: string;
  password: string;
  rol: RolType;
  datosContacto?: DatosContacto;
};

/**
 * Da de alta un usuario. Para COLABORADOR/SOLICITANTE valida contacto y que
 * municipio pertenezca al estado del catálogo (feature 020).
 */
export async function registrarUsuario(
  { usuarios, hasher, ubicaciones }: RegistrarUsuarioDeps,
  input: RegistrarUsuarioInput,
): Promise<Usuario> {
  if (!esRolAutoRegistrable(input.rol)) {
    throw new RolNoAutoRegistrableError(input.rol);
  }

  const email = input.email.trim().toLowerCase();

  const existentePorEmail = await usuarios.buscarPorEmail(email);
  if (existentePorEmail) {
    throw new EmailYaRegistradoError(email);
  }

  const passwordHash = await hasher.hash(input.password);

  if (input.rol === Rol.COLABORADOR || input.rol === Rol.SOLICITANTE) {
    if (!input.datosContacto) {
      throw new DatosContactoInvalidosError("La cédula es obligatoria.");
    }
    const validacion = validarDatosContacto(input.datosContacto);
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
    const cedulaExistente = await usuarios.buscarPorCedula(
      validacion.valor.cedula,
    );
    if (cedulaExistente) {
      throw new CedulaYaRegistradaError();
    }
    return usuarios.crear({
      email,
      nombre: input.nombre.trim(),
      passwordHash,
      rol: input.rol,
      cedula: validacion.valor.cedula,
      telefono: validacion.valor.telefono,
      telefonoEsWhatsApp: validacion.valor.telefonoEsWhatsApp,
      estadoId: ubicacion.valor.estadoId,
      municipioId: ubicacion.valor.municipioId,
    });
  }

  return usuarios.crear({
    email,
    nombre: input.nombre.trim(),
    passwordHash,
    rol: input.rol,
    telefonoEsWhatsApp: input.datosContacto?.telefonoEsWhatsApp ?? false,
  });
}
