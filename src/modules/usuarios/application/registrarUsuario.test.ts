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

function crearDeps() {
  return {
    usuarios: new InMemoryUsuarioRepository(),
    hasher: new FakePasswordHasher(),
  };
}

const datosContactoBase: DatosContacto = {
  cedula: "V12345678",
  telefono: "04121234567",
  telefonoEsWhatsApp: true,
  estado: "La Guaira",
  parroquia: "Catia La Mar",
};

const baseInput: RegistrarUsuarioInput = {
  nombre: "Ana Pérez",
  email: "ana@example.com",
  password: "contraseña-segura",
  rol: Rol.COLABORADOR,
  datosContacto: datosContactoBase,
};

describe("registrarUsuario", () => {
  it("crea un colaborador con datos de contacto normalizados", async () => {
    const deps = crearDeps();

    const usuario = await registrarUsuario(deps, {
      ...baseInput,
      datosContacto: {
        cedula: "v-12.345.678",
        telefono: "+58 412 1234567",
        telefonoEsWhatsApp: true,
        estado: "  La Guaira  ",
        parroquia: "Catia La Mar",
      },
    });

    expect(usuario.id).toBeTruthy();
    expect(usuario.email).toBe("ana@example.com");
    expect(usuario.rol).toBe(Rol.COLABORADOR);
    expect(usuario.estadoVerificacion).toBe("PENDIENTE");
    expect(usuario.cedula).toBe("V12345678");
    expect(usuario.telefono).toBe("04121234567");
    expect(usuario.telefonoEsWhatsApp).toBe(true);
    expect(usuario.estado).toBe("La Guaira");
    expect(usuario.parroquia).toBe("Catia La Mar");
  });

  it("crea un solicitante también con los cinco campos", async () => {
    const deps = crearDeps();
    const usuario = await registrarUsuario(deps, {
      ...baseInput,
      rol: Rol.SOLICITANTE,
    });
    expect(usuario.rol).toBe(Rol.SOLICITANTE);
    expect(usuario.cedula).toBe("V12345678");
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

  it("propaga el error de dominio si algún campo es inválido", async () => {
    const deps = crearDeps();
    await expect(
      registrarUsuario(deps, {
        ...baseInput,
        datosContacto: { ...datosContactoBase, telefono: "0499 1234567" },
      }),
    ).rejects.toMatchObject({
      name: "DatosContactoInvalidosError",
      message: "El código de operadora no es válido en Venezuela.",
    });
  });

  it("rechaza registrar una cédula que ya existe", async () => {
    const deps = crearDeps();
    await registrarUsuario(deps, baseInput);
    await expect(
      registrarUsuario(deps, {
        ...baseInput,
        email: "otra@example.com",
        datosContacto: { ...datosContactoBase, cedula: "v-12.345.678" },
      }),
    ).rejects.toBeInstanceOf(CedulaYaRegistradaError);
  });

  it("admite ADMIN sin datos de contacto (viven en PerfilAdmin) y guarda flag WhatsApp", async () => {
    const deps = crearDeps();

    const usuario = await registrarUsuario(deps, {
      nombre: "Centro Guaira",
      email: "centro@example.com",
      password: "contraseña-segura",
      rol: Rol.ADMIN,
      datosContacto: {
        cedula: "irrelevante",
        telefono: "irrelevante",
        telefonoEsWhatsApp: true,
        estado: "irrelevante",
        parroquia: "irrelevante",
      },
    });

    expect(usuario.rol).toBe(Rol.ADMIN);
    expect(usuario.estadoVerificacion).toBe("PENDIENTE");
    expect(usuario.cedula).toBeNull();
    expect(usuario.telefono).toBeNull();
    expect(usuario.telefonoEsWhatsApp).toBe(true);
  });

  it("rechaza el rol SUPERADMIN (no auto-registrable)", async () => {
    const deps = crearDeps();
    await expect(
      registrarUsuario(deps, { ...baseInput, rol: Rol.SUPERADMIN }),
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
      registrarUsuario(deps, {
        ...baseInput,
        nombre: "Otra Ana",
        datosContacto: { ...datosContactoBase, cedula: "V87654321" },
      }),
    ).rejects.toBeInstanceOf(EmailYaRegistradoError);
  });
});
