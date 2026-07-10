import { beforeEach, describe, expect, it } from "vitest";
import { TipoDocumento } from "@/modules/usuarios/domain/PerfilAdmin";
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

const baseInput: CrearPerfilAdminInput = {
  usuarioId: "usuario-1",
  nombreCuenta: "Fundación La Guaira",
  estado: "Bolívar",
  parroquia: "Cachamay",
  telefono: "+58 412 0000000",
  telefonoEsWhatsApp: true,
  correo: "contacto@fundacion.org",
  tipoDocumento: TipoDocumento.JURIDICO,
  numeroDocumento: "J-12345678-9",
};

describe("gestionarPerfilAdmin", () => {
  let perfiles: InMemoryPerfilAdminRepository;

  beforeEach(() => {
    perfiles = new InMemoryPerfilAdminRepository();
  });

  describe("crearPerfilAdmin", () => {
    it("crea un perfil válido y normaliza el correo", async () => {
      const perfil = await crearPerfilAdmin(
        { perfiles },
        { ...baseInput, correo: "  Contacto@Fundacion.org " },
      );

      expect(perfil.id).toBeTruthy();
      expect(perfil.usuarioId).toBe("usuario-1");
      expect(perfil.correo).toBe("contacto@fundacion.org");
      expect(perfil.tipoDocumento).toBe(TipoDocumento.JURIDICO);
    });

    it("rechaza un documento sin número", async () => {
      await expect(
        crearPerfilAdmin({ perfiles }, { ...baseInput, numeroDocumento: "  " }),
      ).rejects.toBeInstanceOf(PerfilAdminInvalidoError);
    });

    it("rechaza un tipo de documento no reconocido", async () => {
      await expect(
        crearPerfilAdmin(
          { perfiles },
          // @ts-expect-error probamos un tipo inválido en el límite
          { ...baseInput, tipoDocumento: "PASAPORTE" },
        ),
      ).rejects.toBeInstanceOf(PerfilAdminInvalidoError);
    });

    it("rechaza un correo con formato inválido", async () => {
      await expect(
        crearPerfilAdmin({ perfiles }, { ...baseInput, correo: "no-es-correo" }),
      ).rejects.toBeInstanceOf(PerfilAdminInvalidoError);
    });

    it("rechaza un teléfono vacío", async () => {
      await expect(
        crearPerfilAdmin({ perfiles }, { ...baseInput, telefono: "   " }),
      ).rejects.toBeInstanceOf(PerfilAdminInvalidoError);
    });

    it("rechaza un segundo perfil para el mismo usuario", async () => {
      await crearPerfilAdmin({ perfiles }, baseInput);

      await expect(
        crearPerfilAdmin({ perfiles }, baseInput),
      ).rejects.toBeInstanceOf(PerfilAdminDuplicadoError);
    });
  });

  describe("actualizarPerfilAdmin", () => {
    it("aplica cambios válidos", async () => {
      await crearPerfilAdmin({ perfiles }, baseInput);

      const actualizado = await actualizarPerfilAdmin(
        { perfiles },
        "usuario-1",
        { parroquia: "Unare", telefono: "+58 414 1111111" },
      );

      expect(actualizado.parroquia).toBe("Unare");
      expect(actualizado.telefono).toBe("+58 414 1111111");
      expect(actualizado.nombreCuenta).toBe(baseInput.nombreCuenta);
    });

    it("rechaza cambios que dejan el perfil inválido", async () => {
      await crearPerfilAdmin({ perfiles }, baseInput);

      await expect(
        actualizarPerfilAdmin({ perfiles }, "usuario-1", {
          numeroDocumento: "",
        }),
      ).rejects.toBeInstanceOf(PerfilAdminInvalidoError);
    });

    it("rechaza actualizar un perfil inexistente", async () => {
      await expect(
        actualizarPerfilAdmin({ perfiles }, "fantasma", { estado: "Miranda" }),
      ).rejects.toBeInstanceOf(PerfilAdminNoEncontradoError);
    });
  });

  describe("obtenerPerfilAdmin", () => {
    it("devuelve el perfil de la cuenta o null", async () => {
      expect(await obtenerPerfilAdmin({ perfiles }, "usuario-1")).toBeNull();
      await crearPerfilAdmin({ perfiles }, baseInput);
      const perfil = await obtenerPerfilAdmin({ perfiles }, "usuario-1");
      expect(perfil?.usuarioId).toBe("usuario-1");
    });
  });
});
