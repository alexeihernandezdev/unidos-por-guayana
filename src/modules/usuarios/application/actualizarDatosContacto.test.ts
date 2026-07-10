import { describe, expect, it } from "vitest";
import type { DatosContacto } from "@/modules/usuarios/domain/datosContacto";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { actualizarDatosContacto } from "./actualizarDatosContacto";
import {
  CedulaYaRegistradaError,
  UsuarioNoEncontradoError,
} from "./errors";
import { FakePasswordHasher, InMemoryUsuarioRepository } from "./fakes";
import { registrarUsuario } from "./registrarUsuario";
import { crearUbicacionFakeTest } from "./ubicacionTestHelper";

async function crearColaborador(
  overrides: Partial<DatosContacto> = {},
  email = "col@example.com",
) {
  const usuarios = new InMemoryUsuarioRepository();
  const hasher = new FakePasswordHasher();
  const { ubicacion, estadoId, municipioId } = crearUbicacionFakeTest();
  const usuario = await registrarUsuario(
    { usuarios, hasher, ubicacion },
    {
      nombre: "Col",
      email,
      password: "contraseña-segura",
      rol: Rol.COLABORADOR,
      datosContacto: {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId,
        municipioId,
        ...overrides,
      },
    },
  );
  return { usuarios, ubicacion, usuario, estadoId, municipioId };
}

describe("actualizarDatosContacto", () => {
  it("normaliza y persiste los cinco campos", async () => {
    const { usuarios, ubicacion, usuario, estadoId, municipioId } =
      await crearColaborador();

    const actualizado = await actualizarDatosContacto(
      { usuarios, ubicacion },
      usuario.id,
      {
        cedula: "e-9.876.543",
        telefono: "+58 414 7654321",
        telefonoEsWhatsApp: false,
        estadoId,
        municipioId,
      },
    );

    expect(actualizado.cedula).toBe("E9876543");
    expect(actualizado.telefono).toBe("04147654321");
    expect(actualizado.estadoId).toBe(estadoId);
    expect(actualizado.municipioId).toBe(municipioId);
  });

  it("rechaza si otra cuenta ya tiene esa cédula", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const hasher = new FakePasswordHasher();
    const { ubicacion, estadoId, municipioId } = crearUbicacionFakeTest();
    const deps = { usuarios, hasher, ubicacion };

    const uno = await registrarUsuario(deps, {
      nombre: "Col",
      email: "col@example.com",
      password: "contraseña-segura",
      rol: Rol.COLABORADOR,
      datosContacto: {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId,
        municipioId,
      },
    });

    await registrarUsuario(deps, {
      nombre: "Col 2",
      email: "dos@example.com",
      password: "contraseña-segura",
      rol: Rol.COLABORADOR,
      datosContacto: {
        cedula: "V87654321",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId,
        municipioId,
      },
    });

    await expect(
      actualizarDatosContacto({ usuarios, ubicacion }, uno.id, {
        cedula: "V87654321",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId,
        municipioId,
      }),
    ).rejects.toBeInstanceOf(CedulaYaRegistradaError);
  });

  it("rechaza estadoId vacío", async () => {
    const { usuarios, ubicacion, usuario, municipioId } =
      await crearColaborador();

    await expect(
      actualizarDatosContacto({ usuarios, ubicacion }, usuario.id, {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId: "",
        municipioId,
      }),
    ).rejects.toMatchObject({
      name: "DatosContactoInvalidosError",
      message: "Indica el estado.",
    });
  });

  it("rechaza si el usuario no existe", async () => {
    const { usuarios, ubicacion, estadoId, municipioId } =
      await crearColaborador();
    await expect(
      actualizarDatosContacto({ usuarios, ubicacion }, "no-existe", {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId,
        municipioId,
      }),
    ).rejects.toBeInstanceOf(UsuarioNoEncontradoError);
  });
});
