import { beforeEach, describe, expect, it } from "vitest";
import { TipoDocumento } from "@/modules/usuarios/domain/PerfilAdmin";
import { FakeUbicacionRepository } from "@/modules/ubicacion/application/fakes";
import { InMemoryPerfilAdminRepository } from "./fakes";
import {
  PerfilAdminDuplicadoError,
  PerfilAdminInvalidoError,
  PerfilAdminNoEncontradoError,
} from "./errors";
import {
  actualizarPerfilAdmin,
  crearPerfilAdmin,
  obtenerPerfilAdmin,
  type CrearPerfilAdminInput,
} from "./gestionarPerfilAdmin";
import { crearUbicacionFakeTest } from "./ubicacionTestHelper";

describe("gestionarPerfilAdmin", () => {
  let perfiles: InMemoryPerfilAdminRepository;
  let ubicacion: FakeUbicacionRepository;
  let estadoId: string;
  let municipioId: string;
  let baseInput: CrearPerfilAdminInput;

  beforeEach(() => {
    perfiles = new InMemoryPerfilAdminRepository();
    const fake = crearUbicacionFakeTest();
    ubicacion = fake.ubicacion;
    estadoId = fake.estadoId;
    municipioId = fake.municipioId;
    baseInput = {
      usuarioId: "usuario-1",
      nombreCuenta: "Fundación La Guaira",
      estadoId,
      municipioId,
      telefono: "+58 412 0000000",
      telefonoEsWhatsApp: true,
      correo: "contacto@fundacion.org",
      tipoDocumento: TipoDocumento.JURIDICO,
      numeroDocumento: "J-12345678-9",
    };
  });

  it("crea un perfil válido y normaliza el correo", async () => {
    const perfil = await crearPerfilAdmin(
      { perfiles, ubicacion },
      { ...baseInput, correo: "  Contacto@Fundacion.org " },
    );

    expect(perfil.correo).toBe("contacto@fundacion.org");
    expect(perfil.estadoId).toBe(estadoId);
    expect(perfil.municipioId).toBe(municipioId);
  });

  it("rechaza municipio que no pertenece al estado", async () => {
    await expect(
      crearPerfilAdmin(
        { perfiles, ubicacion },
        { ...baseInput, estadoId: "otro-estado" },
      ),
    ).rejects.toBeInstanceOf(PerfilAdminInvalidoError);
  });

  it("actualiza campos válidos", async () => {
    await crearPerfilAdmin({ perfiles, ubicacion }, baseInput);
    const actualizado = await actualizarPerfilAdmin(
      { perfiles, ubicacion },
      "usuario-1",
      { telefono: "+58 414 1111111" },
    );
    expect(actualizado.telefono).toBe("+58 414 1111111");
  });

  it("rechaza perfil duplicado", async () => {
    await crearPerfilAdmin({ perfiles, ubicacion }, baseInput);
    await expect(
      crearPerfilAdmin({ perfiles, ubicacion }, baseInput),
    ).rejects.toBeInstanceOf(PerfilAdminDuplicadoError);
  });

  it("obtenerPerfilAdmin devuelve null si no existe", async () => {
    expect(await obtenerPerfilAdmin({ perfiles, ubicacion }, "usuario-1")).toBeNull();
  });

  it("rechaza actualizar perfil inexistente", async () => {
    await expect(
      actualizarPerfilAdmin({ perfiles, ubicacion }, "fantasma", {
        telefono: "04120000000",
      }),
    ).rejects.toBeInstanceOf(PerfilAdminNoEncontradoError);
  });
});
