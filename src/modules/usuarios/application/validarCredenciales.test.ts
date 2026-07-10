import { describe, expect, it } from "vitest";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { FakePasswordHasher, InMemoryUsuarioRepository } from "./fakes";
import { registrarUsuario } from "./registrarUsuario";
import { validarCredenciales } from "./validarCredenciales";
import { crearUbicacionFakeTest } from "./ubicacionTestHelper";

async function crearDepsConUsuario() {
  const usuarios = new InMemoryUsuarioRepository();
  const hasher = new FakePasswordHasher();
  const { ubicacion, estadoId, municipioId } = crearUbicacionFakeTest();
  await registrarUsuario(
    { usuarios, hasher, ubicacion },
    {
      nombre: "Ana Pérez",
      email: "ana@example.com",
      password: "contraseña-segura",
      rol: Rol.COLABORADOR,
      datosContacto: {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId,
        municipioId,
      },
    },
  );
  return { usuarios, hasher };
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
  });

  it("rechaza contraseña incorrecta", async () => {
    const deps = await crearDepsConUsuario();
    const usuario = await validarCredenciales(deps, "ana@example.com", "mala");
    expect(usuario).toBeNull();
  });
});
