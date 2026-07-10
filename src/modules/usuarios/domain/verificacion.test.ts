import { describe, expect, it } from "vitest";
import { EstadoVerificacion, Rol } from "./Rol";
import {
  esTransicionVerificacionValida,
  puedeOperarComoAdmin,
} from "./verificacion";

describe("esTransicionVerificacionValida", () => {
  it("permite resolver una cuenta PENDIENTE hacia VERIFICADO o RECHAZADO", () => {
    expect(
      esTransicionVerificacionValida(
        EstadoVerificacion.PENDIENTE,
        EstadoVerificacion.VERIFICADO,
      ),
    ).toBe(true);
    expect(
      esTransicionVerificacionValida(
        EstadoVerificacion.PENDIENTE,
        EstadoVerificacion.RECHAZADO,
      ),
    ).toBe(true);
  });

  it("no reabre ni re-resuelve estados terminales", () => {
    expect(
      esTransicionVerificacionValida(
        EstadoVerificacion.VERIFICADO,
        EstadoVerificacion.RECHAZADO,
      ),
    ).toBe(false);
    expect(
      esTransicionVerificacionValida(
        EstadoVerificacion.RECHAZADO,
        EstadoVerificacion.VERIFICADO,
      ),
    ).toBe(false);
    expect(
      esTransicionVerificacionValida(
        EstadoVerificacion.PENDIENTE,
        EstadoVerificacion.PENDIENTE,
      ),
    ).toBe(false);
  });
});

describe("puedeOperarComoAdmin", () => {
  it("es verdadero solo para un ADMIN VERIFICADO", () => {
    expect(
      puedeOperarComoAdmin({
        rol: Rol.ADMIN,
        estadoVerificacion: EstadoVerificacion.VERIFICADO,
      }),
    ).toBe(true);
  });

  it("bloquea a un ADMIN en PENDIENTE o RECHAZADO", () => {
    expect(
      puedeOperarComoAdmin({
        rol: Rol.ADMIN,
        estadoVerificacion: EstadoVerificacion.PENDIENTE,
      }),
    ).toBe(false);
    expect(
      puedeOperarComoAdmin({
        rol: Rol.ADMIN,
        estadoVerificacion: EstadoVerificacion.RECHAZADO,
      }),
    ).toBe(false);
  });

  it("bloquea a cualquier otro rol aunque esté VERIFICADO", () => {
    for (const rol of [Rol.SUPERADMIN, Rol.COLABORADOR, Rol.SOLICITANTE]) {
      expect(
        puedeOperarComoAdmin({
          rol,
          estadoVerificacion: EstadoVerificacion.VERIFICADO,
        }),
      ).toBe(false);
    }
  });
});
