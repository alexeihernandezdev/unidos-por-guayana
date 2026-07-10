import type { PasswordHasher } from "@/modules/usuarios/domain/PasswordHasher";
import {
  validarDatosContacto,
  type DatosContacto,
} from "@/modules/usuarios/domain/datosContacto";
import { esRolAutoRegistrable, Rol, type Rol as RolType } from "@/modules/usuarios/domain/Rol";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import type { UsuarioRepository } from "@/modules/usuarios/domain/UsuarioRepository";
import { validarUbicacionCatalogo } from "@/modules/ubicacion/application/validarUbicacionCatalogo";
import type { UbicacionRepository } from "@/modules/ubicacion/domain/UbicacionRepository";
import {
  CedulaYaRegistradaError,
  DatosContactoInvalidosError,
  EmailYaRegistradoError,
  RolNoAutoRegistrableError,
} from "./errors";

export type RegistrarUsuarioDeps = {
  usuarios: UsuarioRepository;
  hasher: PasswordHasher;
  ubicacion: UbicacionRepository;
};

export type RegistrarUsuarioInput = {
  nombre: string;
  email: string;
  password: string;
  rol: RolType;
  datosContacto?: DatosContacto;
};

export async function registrarUsuario(
  { usuarios, hasher, ubicacion }: RegistrarUsuarioDeps,
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

    const cedulaExistente = await usuarios.buscarPorCedula(validacion.valor.cedula);
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
      estadoId: validacion.valor.estadoId,
      municipioId: validacion.valor.municipioId,
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
