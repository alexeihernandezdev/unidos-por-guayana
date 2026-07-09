import { describe, expect, it } from "vitest";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  FakePasswordHasher,
  InMemoryUsuarioRepository,
  PREFIJO_HASH,
} from "./fakes";
import { EmailYaRegistradoError, RolNoAutoRegistrableError } from "./errors";
import {
  registrarUsuario,
  type RegistrarUsuarioInput,
} from "./registrarUsuario";

function crearDeps() {
  return { usuarios: new InMemoryUsuarioRepository(), hasher: new FakePasswordHasher() };
}

const baseInput: RegistrarUsuarioInput = {
  nombre: "Ana Pérez",
  email: "ana@example.com",
  password: "contraseña-segura",
  rol: Rol.COLABORADOR,
};

describe("registrarUsuario", () => {
  it("crea un usuario con un rol auto-registrable", async () => {
    const deps = crearDeps();

    const usuario = await registrarUsuario(deps, baseInput);

    expect(usuario.id).toBeTruthy();
    expect(usuario.email).toBe("ana@example.com");
    expect(usuario.rol).toBe(Rol.COLABORADOR);
    expect(usuario.estadoVerificacion).toBe("PENDIENTE");
  });

  it("rechaza el rol ADMIN (no auto-registrable)", async () => {
    const deps = crearDeps();

    await expect(
      registrarUsuario(deps, { ...baseInput, rol: Rol.ADMIN }),
    ).rejects.toBeInstanceOf(RolNoAutoRegistrableError);

    expect(await deps.usuarios.buscarPorEmail(baseInput.email)).toBeNull();
  });

  it("hashea la contraseña (nunca se guarda en claro)", async () => {
    const deps = crearDeps();

    const usuario = await registrarUsuario(deps, baseInput);

    expect(usuario.passwordHash).not.toBe(baseInput.password);
    expect(usuario.passwordHash).toBe(`${PREFIJO_HASH}${baseInput.password}`);
  });

  it("normaliza el email (trim + minúsculas)", async () => {
    const deps = crearDeps();

    const usuario = await registrarUsuario(deps, {
      ...baseInput,
      email: "  ANA@Example.com  ",
    });

    expect(usuario.email).toBe("ana@example.com");
  });

  it("rechaza un email ya registrado", async () => {
    const deps = crearDeps();
    await registrarUsuario(deps, baseInput);

    await expect(
      registrarUsuario(deps, { ...baseInput, nombre: "Otra Ana" }),
    ).rejects.toBeInstanceOf(EmailYaRegistradoError);
  });
});
