import { describe, expect, it } from "vitest";
import type { DatosContacto } from "@/modules/usuarios/domain/datosContacto";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  CedulaYaRegistradaError,
  DatosContactoInvalidosError,
  EmailYaRegistradoError,
  RolNoAutoRegistrableError,
} from "./errors";
import {
  FakePasswordHasher,
  InMemoryUsuarioRepository,
  PREFIJO_HASH,
} from "./fakes";
import {
  registrarUsuario,
  type RegistrarUsuarioInput,
} from "./registrarUsuario";
import { crearUbicacionFakeTest } from "./ubicacionTestHelper";

function crearDeps() {
  const { ubicacion, estadoId, municipioId } = crearUbicacionFakeTest();
  return {
    usuarios: new InMemoryUsuarioRepository(),
    hasher: new FakePasswordHasher(),
    ubicacion,
    estadoId,
    municipioId,
  };
}

function datosContacto(estadoId: string, municipioId: string): DatosContacto {
  return {
    cedula: "V12345678",
    telefono: "04121234567",
    telefonoEsWhatsApp: true,
    estadoId,
    municipioId,
  };
}

const baseInput = (deps: ReturnType<typeof crearDeps>): RegistrarUsuarioInput => ({
  nombre: "Ana Pérez",
  email: "ana@example.com",
  password: "contraseña-segura",
  rol: Rol.COLABORADOR,
  datosContacto: datosContacto(deps.estadoId, deps.municipioId),
});

describe("registrarUsuario", () => {
  it("crea un colaborador con datos de contacto normalizados", async () => {
    const deps = crearDeps();

    const usuario = await registrarUsuario(deps, {
      ...baseInput(deps),
      datosContacto: {
        cedula: "v-12.345.678",
        telefono: "+58 412 1234567",
        telefonoEsWhatsApp: true,
        estadoId: deps.estadoId,
        municipioId: deps.municipioId,
      },
    });

    expect(usuario.cedula).toBe("V12345678");
    expect(usuario.telefono).toBe("04121234567");
    expect(usuario.estadoId).toBe(deps.estadoId);
    expect(usuario.municipioId).toBe(deps.municipioId);
  });

  it("rechaza municipio que no pertenece al estado", async () => {
    const deps = crearDeps();
    await expect(
      registrarUsuario(deps, {
        ...baseInput(deps),
        datosContacto: datosContacto("otro-estado", deps.municipioId),
      }),
    ).rejects.toBeInstanceOf(DatosContactoInvalidosError);
  });

  it("rechaza colaborador sin datos de contacto", async () => {
    const deps = crearDeps();
    await expect(
      registrarUsuario(deps, {
        nombre: "Ana",
        email: "ana@example.com",
        password: "contraseña-segura",
        rol: Rol.COLABORADOR,
      }),
    ).rejects.toBeInstanceOf(DatosContactoInvalidosError);
  });

  it("rechaza cédula duplicada", async () => {
    const deps = crearDeps();
    await registrarUsuario(deps, baseInput(deps));
    await expect(
      registrarUsuario(deps, {
        ...baseInput(deps),
        email: "otra@example.com",
      }),
    ).rejects.toBeInstanceOf(CedulaYaRegistradaError);
  });

  it("admite ADMIN sin datos de contacto en Usuario", async () => {
    const deps = crearDeps();
    const usuario = await registrarUsuario(deps, {
      nombre: "Centro Guaira",
      email: "centro@example.com",
      password: "contraseña-segura",
      rol: Rol.ADMIN,
    });
    expect(usuario.rol).toBe(Rol.ADMIN);
    expect(usuario.cedula).toBeNull();
  });

  it("rechaza SUPERADMIN", async () => {
    const deps = crearDeps();
    await expect(
      registrarUsuario(deps, { ...baseInput(deps), rol: Rol.SUPERADMIN }),
    ).rejects.toBeInstanceOf(RolNoAutoRegistrableError);
  });

  it("hashea la contraseña", async () => {
    const deps = crearDeps();
    const input = baseInput(deps);
    const usuario = await registrarUsuario(deps, input);
    expect(usuario.passwordHash).toBe(`${PREFIJO_HASH}${input.password}`);
  });

  it("rechaza email duplicado", async () => {
    const deps = crearDeps();
    await registrarUsuario(deps, baseInput(deps));
    await expect(
      registrarUsuario(deps, {
        ...baseInput(deps),
        datosContacto: { ...datosContacto(deps.estadoId, deps.municipioId), cedula: "V87654321" },
      }),
    ).rejects.toBeInstanceOf(EmailYaRegistradoError);
  });
});
