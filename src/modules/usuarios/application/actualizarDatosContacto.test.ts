import { describe, expect, it } from "vitest";
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

async function crearColaborador(
  usuarios: InMemoryUsuarioRepository,
  hasher: FakePasswordHasher,
  overrides: Partial<DatosContacto> = {},
  email = "col@example.com",
) {
  return registrarUsuario(
    { usuarios, hasher },
    {
      nombre: "Col",
      email,
      password: "contraseña-segura",
      rol: Rol.COLABORADOR,
      datosContacto: {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estado: "La Guaira",
        parroquia: "Catia La Mar",
        ...overrides,
      },
    },
  );
}

describe("actualizarDatosContacto", () => {
  it("normaliza y persiste los cinco campos", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const hasher = new FakePasswordHasher();
    const usuario = await crearColaborador(usuarios, hasher);

    const actualizado = await actualizarDatosContacto({ usuarios }, usuario.id, {
      cedula: "e-9.876.543",
      telefono: "+58 414 7654321",
      telefonoEsWhatsApp: false,
      estado: "  Miranda  ",
      parroquia: "El   Hatillo",
    });

    expect(actualizado.cedula).toBe("E9876543");
    expect(actualizado.telefono).toBe("04147654321");
    expect(actualizado.telefonoEsWhatsApp).toBe(false);
    expect(actualizado.estado).toBe("Miranda");
    expect(actualizado.parroquia).toBe("El Hatillo");
  });

  it("permite guardar sin cambiar la propia cédula", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const hasher = new FakePasswordHasher();
    const usuario = await crearColaborador(usuarios, hasher);

    const actualizado = await actualizarDatosContacto({ usuarios }, usuario.id, {
      cedula: "V12345678",
      telefono: "04121234567",
      telefonoEsWhatsApp: true,
      estado: "La Guaira",
      parroquia: "Maiquetía",
    });

    expect(actualizado.parroquia).toBe("Maiquetía");
    expect(actualizado.cedula).toBe("V12345678");
  });

  it("rechaza si otra cuenta ya tiene esa cédula", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const hasher = new FakePasswordHasher();
    const uno = await crearColaborador(usuarios, hasher);
    await crearColaborador(
      usuarios,
      hasher,
      { cedula: "V87654321" },
      "dos@example.com",
    );

    await expect(
      actualizarDatosContacto({ usuarios }, uno.id, {
        cedula: "V87654321",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estado: "La Guaira",
        parroquia: "Catia",
      }),
    ).rejects.toBeInstanceOf(CedulaYaRegistradaError);
  });

  it("rechaza formato inválido con mensaje del dominio", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const hasher = new FakePasswordHasher();
    const usuario = await crearColaborador(usuarios, hasher);

    await expect(
      actualizarDatosContacto({ usuarios }, usuario.id, {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estado: "",
        parroquia: "Catia",
      }),
    ).rejects.toMatchObject({
      name: "DatosContactoInvalidosError",
      message: "Indica el estado.",
    });
  });

  it("rechaza si el usuario no existe", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    await expect(
      actualizarDatosContacto({ usuarios }, "no-existe", {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estado: "La Guaira",
        parroquia: "Catia",
      }),
    ).rejects.toBeInstanceOf(UsuarioNoEncontradoError);
  });

  it("rechaza si el usuario es ADMIN (sus datos viven en PerfilAdmin)", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const hasher = new FakePasswordHasher();
    const admin = await registrarUsuario(
      { usuarios, hasher },
      {
        nombre: "Centro",
        email: "centro@example.com",
        password: "contraseña-segura",
        rol: Rol.ADMIN,
      },
    );

    await expect(
      actualizarDatosContacto({ usuarios }, admin.id, {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estado: "La Guaira",
        parroquia: "Catia",
      }),
    ).rejects.toBeInstanceOf(DatosContactoInvalidosError);
  });
});
