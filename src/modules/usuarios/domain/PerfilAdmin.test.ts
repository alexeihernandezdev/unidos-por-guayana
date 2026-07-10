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
  estadoId: "est-lg",
  municipioId: "mun-vargas",
  telefono: "+58 412 0000000",
  telefonoEsWhatsApp: false,
  correo: "centro@example.org",
  tipoDocumento: TipoDocumento.NATURAL,
  numeroDocumento: "V-12345678",
};

describe("problemasDePerfilAdmin", () => {
  it("no reporta problemas con datos válidos", () => {
    expect(problemasDePerfilAdmin(datosValidos)).toEqual([]);
  });

  it("reporta municipio vacío", () => {
    expect(
      problemasDePerfilAdmin({ ...datosValidos, municipioId: "  " }).length,
    ).toBeGreaterThan(0);
  });
});

describe("ubicacionPorDefecto", () => {
  it("devuelve estadoId y municipioId del perfil", () => {
    expect(
      ubicacionPorDefecto({ estadoId: "est-lg", municipioId: "mun-vargas" }),
    ).toEqual({ estadoId: "est-lg", municipioId: "mun-vargas" });
  });
});

describe("esDocumentoValido", () => {
  it("acepta JURIDICO/NATURAL con número", () => {
    expect(esDocumentoValido(TipoDocumento.JURIDICO, "J-1")).toBe(true);
  });
});
