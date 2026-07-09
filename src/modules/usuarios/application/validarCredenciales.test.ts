import { describe, expect, it } from "vitest";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { FakePasswordHasher, InMemoryUsuarioRepository } from "./fakes";
import { registrarUsuario } from "./registrarUsuario";
import { validarCredenciales } from "./validarCredenciales";

async function crearDepsConUsuario() {
  const deps = { usuarios: new InMemoryUsuarioRepository(), hasher: new FakePasswordHasher() };
  await registrarUsuario(deps, {
    nombre: "Ana Pérez",
    email: "ana@example.com",
    password: "contraseña-segura",
    rol: Rol.COLABORADOR,
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
