import { describe, expect, it } from "vitest";
import { catalogoPrueba } from "@/modules/ubicaciones/application/fakes";
import type { DatosContacto } from "@/modules/usuarios/domain/datosContacto";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { actualizarDatosContacto } from "./actualizarDatosContacto";
import {
  CedulaYaRegistradaError,
  DatosContactoInvalidosError,
  UsuarioNoEncontradoError,
} from "./errors";
import { FakePasswordHasher, InMemoryUsuarioRepository } from "./fakes";
import { registrarUsuario } from "./registrarUsuario";

function crearDeps() {
  const { repo } = catalogoPrueba();
  return {
    usuarios: new InMemoryUsuarioRepository(),
    hasher: new FakePasswordHasher(),
    ubicaciones: repo,
  };
}

async function crearColaborador(
  deps: ReturnType<typeof crearDeps>,
  overrides: Partial<DatosContacto> = {},
  email = "col@example.com",
) {
  return registrarUsuario(deps, {
    nombre: "Col",
    email,
    password: "contraseña-segura",
    rol: Rol.COLABORADOR,
    datosContacto: {
      cedula: "V12345678",
      telefono: "04121234567",
      telefonoEsWhatsApp: true,
      estadoId: "est-lg",
      municipioId: "mun-vargas",
      ...overrides,
    },
  });
}

describe("actualizarDatosContacto", () => {
  it("normaliza y persiste los cinco campos", async () => {
    const deps = crearDeps();
    const usuario = await crearColaborador(deps);

    const actualizado = await actualizarDatosContacto(
      { usuarios: deps.usuarios, ubicaciones: deps.ubicaciones },
      usuario.id,
      {
        cedula: "e-9.876.543",
        telefono: "+58 414 7654321",
        telefonoEsWhatsApp: false,
        estadoId: "  est-mi  ",
        municipioId: "mun-hatillo",
      },
    );

    expect(actualizado.cedula).toBe("E9876543");
    expect(actualizado.telefono).toBe("04147654321");
    expect(actualizado.telefonoEsWhatsApp).toBe(false);
    expect(actualizado.estadoId).toBe("est-mi");
    expect(actualizado.municipioId).toBe("mun-hatillo");
  });

  it("permite guardar sin cambiar la propia cédula", async () => {
    const deps = crearDeps();
    const usuario = await crearColaborador(deps);

    const actualizado = await actualizarDatosContacto(
      { usuarios: deps.usuarios, ubicaciones: deps.ubicaciones },
      usuario.id,
      {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId: "est-lg",
        municipioId: "mun-vargas",
      },
    );

    expect(actualizado.municipioId).toBe("mun-vargas");
    expect(actualizado.cedula).toBe("V12345678");
  });

  it("rechaza si otra cuenta ya tiene esa cédula", async () => {
    const deps = crearDeps();
    const uno = await crearColaborador(deps);
    await crearColaborador(deps, { cedula: "V87654321" }, "dos@example.com");

    await expect(
      actualizarDatosContacto(
        { usuarios: deps.usuarios, ubicaciones: deps.ubicaciones },
        uno.id,
        {
          cedula: "V87654321",
          telefono: "04121234567",
          telefonoEsWhatsApp: true,
          estadoId: "est-lg",
          municipioId: "mun-vargas",
        },
      ),
    ).rejects.toBeInstanceOf(CedulaYaRegistradaError);
  });

  it("rechaza formato inválido con mensaje del dominio", async () => {
    const deps = crearDeps();
    const usuario = await crearColaborador(deps);

    await expect(
      actualizarDatosContacto(
        { usuarios: deps.usuarios, ubicaciones: deps.ubicaciones },
        usuario.id,
        {
          cedula: "V12345678",
          telefono: "04121234567",
          telefonoEsWhatsApp: true,
          estadoId: "",
          municipioId: "mun-vargas",
        },
      ),
    ).rejects.toMatchObject({
      name: "DatosContactoInvalidosError",
      message: "Selecciona el estado.",
    });
  });

  it("rechaza municipio que no pertenece al estado seleccionado", async () => {
    const deps = crearDeps();
    const usuario = await crearColaborador(deps);

    await expect(
      actualizarDatosContacto(
        { usuarios: deps.usuarios, ubicaciones: deps.ubicaciones },
        usuario.id,
        {
          cedula: "V12345678",
          telefono: "04121234567",
          telefonoEsWhatsApp: true,
          estadoId: "est-lg",
          municipioId: "mun-hatillo",
        },
      ),
    ).rejects.toMatchObject({
      name: "DatosContactoInvalidosError",
      message: "El municipio no pertenece al estado seleccionado.",
    });
  });

  it("rechaza si el usuario no existe", async () => {
    const deps = crearDeps();
    await expect(
      actualizarDatosContacto(
        { usuarios: deps.usuarios, ubicaciones: deps.ubicaciones },
        "no-existe",
        {
          cedula: "V12345678",
          telefono: "04121234567",
          telefonoEsWhatsApp: true,
          estadoId: "est-lg",
          municipioId: "mun-vargas",
        },
      ),
    ).rejects.toBeInstanceOf(UsuarioNoEncontradoError);
  });

  it("rechaza si el usuario es ADMIN (sus datos viven en PerfilAdmin)", async () => {
    const deps = crearDeps();
    const admin = await registrarUsuario(deps, {
      nombre: "Centro",
      email: "centro@example.com",
      password: "contraseña-segura",
      rol: Rol.ADMIN,
    });

    await expect(
      actualizarDatosContacto(
        { usuarios: deps.usuarios, ubicaciones: deps.ubicaciones },
        admin.id,
        {
          cedula: "V12345678",
          telefono: "04121234567",
          telefonoEsWhatsApp: true,
          estadoId: "est-lg",
          municipioId: "mun-vargas",
        },
      ),
    ).rejects.toBeInstanceOf(DatosContactoInvalidosError);
  });
});
