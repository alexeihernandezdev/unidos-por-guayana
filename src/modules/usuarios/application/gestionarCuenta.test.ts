import { describe, expect, it } from "vitest";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  DatosCuentaInvalidosError,
  EmailYaRegistradoError,
  PasswordActualIncorrectaError,
  UsuarioNoEncontradoError,
} from "./errors";
import {
  FakePasswordHasher,
  InMemoryUsuarioRepository,
  PREFIJO_HASH,
} from "./fakes";
import { actualizarDatosCuenta, cambiarPassword } from "./gestionarCuenta";

async function sembrarCuenta(
  usuarios: InMemoryUsuarioRepository,
  hasher: FakePasswordHasher,
  overrides: Partial<{ nombre: string; email: string; password: string }> = {},
) {
  return usuarios.crear({
    nombre: overrides.nombre ?? "Sara Superadmin",
    email: overrides.email ?? "sara@example.com",
    passwordHash: await hasher.hash(overrides.password ?? "clave-actual"),
    rol: Rol.SUPERADMIN,
  });
}

describe("actualizarDatosCuenta", () => {
  it("normaliza y guarda nombre y correo", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const cuenta = await sembrarCuenta(usuarios, new FakePasswordHasher());

    const actualizado = await actualizarDatosCuenta({ usuarios }, cuenta.id, {
      nombre: "  Sara S.  ",
      email: "NUEVA@EXAMPLE.COM",
    });

    expect(actualizado.nombre).toBe("Sara S.");
    expect(actualizado.email).toBe("nueva@example.com");
  });

  it("rechaza un nombre demasiado corto", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const cuenta = await sembrarCuenta(usuarios, new FakePasswordHasher());

    await expect(
      actualizarDatosCuenta({ usuarios }, cuenta.id, {
        nombre: "A",
        email: "sara@example.com",
      }),
    ).rejects.toBeInstanceOf(DatosCuentaInvalidosError);
  });

  it("rechaza un correo con formato inválido", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const cuenta = await sembrarCuenta(usuarios, new FakePasswordHasher());

    await expect(
      actualizarDatosCuenta({ usuarios }, cuenta.id, {
        nombre: "Sara",
        email: "no-es-correo",
      }),
    ).rejects.toBeInstanceOf(DatosCuentaInvalidosError);
  });

  it("rechaza un correo que ya usa otra cuenta", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const hasher = new FakePasswordHasher();
    await sembrarCuenta(usuarios, hasher, { email: "ocupado@example.com" });
    const cuenta = await sembrarCuenta(usuarios, hasher, {
      email: "sara@example.com",
    });

    await expect(
      actualizarDatosCuenta({ usuarios }, cuenta.id, {
        nombre: "Sara",
        email: "ocupado@example.com",
      }),
    ).rejects.toBeInstanceOf(EmailYaRegistradoError);
  });

  it("permite conservar el mismo correo (no colisiona consigo mismo)", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const cuenta = await sembrarCuenta(usuarios, new FakePasswordHasher());

    const actualizado = await actualizarDatosCuenta({ usuarios }, cuenta.id, {
      nombre: "Otro Nombre",
      email: "sara@example.com",
    });
    expect(actualizado.email).toBe("sara@example.com");
  });

  it("falla si la cuenta no existe", async () => {
    await expect(
      actualizarDatosCuenta(
        { usuarios: new InMemoryUsuarioRepository() },
        "inexistente",
        { nombre: "Sara", email: "sara@example.com" },
      ),
    ).rejects.toBeInstanceOf(UsuarioNoEncontradoError);
  });
});

describe("cambiarPassword", () => {
  it("cambia la contraseña tras verificar la actual", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const hasher = new FakePasswordHasher();
    const cuenta = await sembrarCuenta(usuarios, hasher, {
      password: "clave-actual",
    });

    const actualizado = await cambiarPassword({ usuarios, hasher }, cuenta.id, {
      passwordActual: "clave-actual",
      passwordNueva: "clave-nueva-123",
    });

    expect(actualizado.passwordHash).toBe(`${PREFIJO_HASH}clave-nueva-123`);
  });

  it("rechaza si la contraseña actual no coincide", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const hasher = new FakePasswordHasher();
    const cuenta = await sembrarCuenta(usuarios, hasher, {
      password: "clave-actual",
    });

    await expect(
      cambiarPassword({ usuarios, hasher }, cuenta.id, {
        passwordActual: "equivocada",
        passwordNueva: "clave-nueva-123",
      }),
    ).rejects.toBeInstanceOf(PasswordActualIncorrectaError);
  });

  it("rechaza una contraseña nueva demasiado corta", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const hasher = new FakePasswordHasher();
    const cuenta = await sembrarCuenta(usuarios, hasher, {
      password: "clave-actual",
    });

    await expect(
      cambiarPassword({ usuarios, hasher }, cuenta.id, {
        passwordActual: "clave-actual",
        passwordNueva: "corta",
      }),
    ).rejects.toBeInstanceOf(DatosCuentaInvalidosError);
  });
});
