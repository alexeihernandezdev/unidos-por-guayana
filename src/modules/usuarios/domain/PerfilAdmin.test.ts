import { describe, expect, it } from "vitest";
import {
  esDocumentoValido,
  problemasDePerfilAdmin,
  TipoDocumento,
  ubicacionPorDefecto,
  type DatosPerfilAdmin,
} from "./PerfilAdmin";

const datosValidos: DatosPerfilAdmin = {
  nombreCuenta: "Centro La Guaira",
  estado: "Bolívar",
  parroquia: "Cachamay",
  telefono: "+58 412 0000000",
  correo: "centro@example.org",
  tipoDocumento: TipoDocumento.NATURAL,
  numeroDocumento: "V-12345678",
};

describe("problemasDePerfilAdmin", () => {
  it("no reporta problemas con datos válidos", () => {
    expect(problemasDePerfilAdmin(datosValidos)).toEqual([]);
  });

  it("reporta el documento sin número", () => {
    expect(
      problemasDePerfilAdmin({ ...datosValidos, numeroDocumento: "  " }).length,
    ).toBeGreaterThan(0);
  });

  it("reporta el correo inválido", () => {
    expect(
      problemasDePerfilAdmin({ ...datosValidos, correo: "arroba" }).length,
    ).toBeGreaterThan(0);
  });
});

describe("esDocumentoValido", () => {
  it("acepta JURIDICO/NATURAL con número", () => {
    expect(esDocumentoValido(TipoDocumento.JURIDICO, "J-1")).toBe(true);
    expect(esDocumentoValido(TipoDocumento.NATURAL, "V-1")).toBe(true);
  });

  it("rechaza tipos no reconocidos o número vacío", () => {
    expect(esDocumentoValido("PASAPORTE", "X-1")).toBe(false);
    expect(esDocumentoValido(TipoDocumento.NATURAL, "  ")).toBe(false);
  });
});

describe("ubicacionPorDefecto", () => {
  it("devuelve estado y parroquia del perfil (herencia para PuntoAcopio, feature 011)", () => {
    expect(ubicacionPorDefecto({ estado: "Bolívar", parroquia: "Unare" })).toEqual({
      estado: "Bolívar",
      parroquia: "Unare",
    });
  });
});
