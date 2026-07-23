import { describe, expect, it } from "vitest";
import { TipoArchivoActividad } from "./ArchivoActividad";
import {
  construirPath,
  esAdjuntoValido,
  esImagenPrincipalValida,
  esPathDeActividad,
  puedeAgregarAdjunto,
} from "./reglasArchivos";

describe("reglasArchivos (actividades)", () => {
  it("construye la ruta con el prefijo de actividades y la extensión del tipo", () => {
    const path = construirPath(
      "act-1",
      TipoArchivoActividad.PRINCIPAL,
      "uuid-9",
      "image/webp",
    );
    expect(path).toBe("actividades/act-1/principal/uuid-9.webp");
  });

  it("los adjuntos van a su propia carpeta", () => {
    const path = construirPath(
      "act-1",
      TipoArchivoActividad.ADJUNTO,
      "uuid-2",
      "application/pdf",
    );
    expect(path).toBe("actividades/act-1/adjuntos/uuid-2.pdf");
  });

  it("valida que un path pertenezca a la actividad y tipo esperados", () => {
    const path = "actividades/act-1/adjuntos/uuid-2.pdf";
    expect(esPathDeActividad(path, "act-1", TipoArchivoActividad.ADJUNTO)).toBe(
      true,
    );
    expect(
      esPathDeActividad(path, "act-1", TipoArchivoActividad.PRINCIPAL),
    ).toBe(false);
    expect(esPathDeActividad(path, "otra", TipoArchivoActividad.ADJUNTO)).toBe(
      false,
    );
  });

  it("aplica los límites de tipo y tamaño compartidos", () => {
    expect(esImagenPrincipalValida("image/png", 1024)).toBe(true);
    expect(esImagenPrincipalValida("application/pdf", 1024)).toBe(false);
    expect(esImagenPrincipalValida("image/png", 6 * 1024 * 1024)).toBe(false);
    expect(esAdjuntoValido("application/pdf", 1024)).toBe(true);
    expect(esAdjuntoValido("application/pdf", 11 * 1024 * 1024)).toBe(false);
    expect(puedeAgregarAdjunto(9)).toBe(true);
    expect(puedeAgregarAdjunto(10)).toBe(false);
  });
});
