import { describe, expect, it } from "vitest";
import { EstadoVerificacion, Rol } from "@/modules/usuarios/domain/Rol";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import { resolverPanelInicio } from "./resolverPanelInicio";

const base: Usuario = {
  id: "u1",
  email: "a@test.com",
  nombre: "Test",
  rol: Rol.COLABORADOR,
  estadoVerificacion: EstadoVerificacion.PENDIENTE,
  cedula: null,
  telefono: null,
  telefonoEsWhatsApp: true,
  estado: null,
  parroquia: null,
  passwordHash: "hash",
};

describe("resolverPanelInicio", () => {
  it("envía ADMIN verificado al panel y pendiente a cuenta-admin", () => {
    expect(
      resolverPanelInicio({
        ...base,
        rol: Rol.ADMIN,
        estadoVerificacion: EstadoVerificacion.VERIFICADO,
      }),
    ).toBe("/panel");
    expect(
      resolverPanelInicio({
        ...base,
        rol: Rol.ADMIN,
        estadoVerificacion: EstadoVerificacion.PENDIENTE,
      }),
    ).toBe("/cuenta-admin");
  });

  it("usa el panel por rol para el resto", () => {
    expect(resolverPanelInicio({ ...base, rol: Rol.SOLICITANTE })).toBe(
      "/solicitudes",
    );
  });
});
