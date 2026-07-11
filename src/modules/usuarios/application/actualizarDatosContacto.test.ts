import { describe, expect, it } from "vitest";
import { catalogoDePrueba } from "@/modules/ubicacion/application/fakes";
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

// Catálogo de prueba (feature 020): La Guaira→Vargas, Miranda→Baruta.
const { repo: catalogo, guaira, miranda, vargas, baruta } = catalogoDePrueba();

async function crearColaborador(
  usuarios: InMemoryUsuarioRepository,
  hasher: FakePasswordHasher,
  overrides: Partial<DatosContacto> = {},
  email = "col@example.com",
) {
  return registrarUsuario(
    { usuarios, hasher, catalogo },
    {
      nombre: "Col",
      email,
      password: "contraseña-segura",
      rol: Rol.COLABORADOR,
      datosContacto: {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId: guaira.id,
        municipioId: vargas.id,
        ...overrides,
      },
    },
  );
}

describe("actualizarDatosContacto", () => {
  it("normaliza y persiste los campos y la ubicación del catálogo", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const hasher = new FakePasswordHasher();
    const usuario = await crearColaborador(usuarios, hasher);

    const actualizado = await actualizarDatosContacto(
      { usuarios, catalogo },
      usuario.id,
      {
        cedula: "e-9.876.543",
        telefono: "+58 414 7654321",
        telefonoEsWhatsApp: false,
        estadoId: `  ${miranda.id}  `,
        municipioId: baruta.id,
      },
    );

    expect(actualizado.cedula).toBe("E9876543");
    expect(actualizado.telefono).toBe("04147654321");
    expect(actualizado.telefonoEsWhatsApp).toBe(false);
    expect(actualizado.estadoId).toBe(miranda.id);
    expect(actualizado.municipioId).toBe(baruta.id);
  });

  it("permite guardar sin cambiar la propia cédula", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const hasher = new FakePasswordHasher();
    const usuario = await crearColaborador(usuarios, hasher);

    const actualizado = await actualizarDatosContacto(
      { usuarios, catalogo },
      usuario.id,
      {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId: miranda.id,
        municipioId: baruta.id,
      },
    );

    expect(actualizado.municipioId).toBe(baruta.id);
    expect(actualizado.cedula).toBe("V12345678");
  });

  it("rechaza un municipio que no pertenece al estado elegido", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const hasher = new FakePasswordHasher();
    const usuario = await crearColaborador(usuarios, hasher);

    await expect(
      actualizarDatosContacto({ usuarios, catalogo }, usuario.id, {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId: guaira.id,
        municipioId: baruta.id,
      }),
    ).rejects.toMatchObject({
      name: "DatosContactoInvalidosError",
      message: "El municipio no pertenece al estado seleccionado.",
    });
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
      actualizarDatosContacto({ usuarios, catalogo }, uno.id, {
        cedula: "V87654321",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId: guaira.id,
        municipioId: vargas.id,
      }),
    ).rejects.toBeInstanceOf(CedulaYaRegistradaError);
  });

  it("rechaza ubicación incompleta con mensaje del dominio", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const hasher = new FakePasswordHasher();
    const usuario = await crearColaborador(usuarios, hasher);

    await expect(
      actualizarDatosContacto({ usuarios, catalogo }, usuario.id, {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId: "",
        municipioId: vargas.id,
      }),
    ).rejects.toMatchObject({
      name: "DatosContactoInvalidosError",
      message: "Selecciona el estado.",
    });
  });

  it("rechaza si el usuario no existe", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    await expect(
      actualizarDatosContacto({ usuarios, catalogo }, "no-existe", {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId: guaira.id,
        municipioId: vargas.id,
      }),
    ).rejects.toBeInstanceOf(UsuarioNoEncontradoError);
  });

  it("rechaza si el usuario es ADMIN (sus datos viven en PerfilAdmin)", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const hasher = new FakePasswordHasher();
    const admin = await registrarUsuario(
      { usuarios, hasher, catalogo },
      {
        nombre: "Centro",
        email: "centro@example.com",
        password: "contraseña-segura",
        rol: Rol.ADMIN,
      },
    );

    await expect(
      actualizarDatosContacto({ usuarios, catalogo }, admin.id, {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId: guaira.id,
        municipioId: vargas.id,
      }),
    ).rejects.toBeInstanceOf(DatosContactoInvalidosError);
  });
});
