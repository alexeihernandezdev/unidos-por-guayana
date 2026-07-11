import { describe, expect, it } from "vitest";
import { catalogoDePrueba } from "@/modules/ubicacion/application/fakes";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { FakePasswordHasher, InMemoryUsuarioRepository } from "./fakes";
import { registrarUsuario } from "./registrarUsuario";
import { validarCredenciales } from "./validarCredenciales";

const { repo: catalogo, guaira, vargas } = catalogoDePrueba();

async function crearDepsConUsuario() {
  const deps = {
    usuarios: new InMemoryUsuarioRepository(),
    hasher: new FakePasswordHasher(),
    catalogo,
  };
  await registrarUsuario(deps, {
    nombre: "Ana Pérez",
    email: "ana@example.com",
    password: "contraseña-segura",
    rol: Rol.COLABORADOR,
    datosContacto: {
      cedula: "V12345678",
      telefono: "04121234567",
      telefonoEsWhatsApp: true,
      estadoId: guaira.id,
      municipioId: vargas.id,
    },
  });
  return deps;
}

describe("validarCredenciales", () => {
  it("acepta credenciales correctas y devuelve el usuario", async () => {
    const deps = await crearDepsConUsuario();

    const usuario = await validarCredenciales(
      deps,
      "ana@example.com",
      "contraseña-segura",
    );

    expect(usuario).not.toBeNull();
    expect(usuario?.email).toBe("ana@example.com");
    expect(usuario?.rol).toBe(Rol.COLABORADOR);
  });

  it("acepta el email con distinto casing/espacios", async () => {
    const deps = await crearDepsConUsuario();

    const usuario = await validarCredenciales(
      deps,
      "  ANA@example.com ",
      "contraseña-segura",
    );

    expect(usuario?.email).toBe("ana@example.com");
  });

  it("rechaza una contraseña incorrecta", async () => {
    const deps = await crearDepsConUsuario();

    const usuario = await validarCredenciales(
      deps,
      "ana@example.com",
      "incorrecta",
    );

    expect(usuario).toBeNull();
  });

  it("rechaza un email inexistente", async () => {
    const deps = await crearDepsConUsuario();

    const usuario = await validarCredenciales(
      deps,
      "nadie@example.com",
      "contraseña-segura",
    );

    expect(usuario).toBeNull();
  });
});
