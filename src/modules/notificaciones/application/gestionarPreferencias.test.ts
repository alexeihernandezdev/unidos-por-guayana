import { describe, expect, it } from "vitest";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { TipoNotificacion } from "@/modules/notificaciones/domain/TipoNotificacion";
import {
  actualizarPreferencia,
  consultarPreferencias,
} from "./gestionarPreferencias";
import { FakePreferenciaNotificacionRepository } from "./fakes";

describe("gestionar preferencias", () => {
  it("consulta el catálogo del rol con defaults", async () => {
    const preferencias = new FakePreferenciaNotificacionRepository();
    const resultado = await consultarPreferencias(
      { preferencias },
      "u1",
      Rol.SUPERADMIN,
    );
    expect(resultado).toHaveLength(1);
    expect(resultado[0].tipo).toBe(TipoNotificacion.NUEVO_ADMIN_PENDIENTE);
  });

  it("guarda un canal aplicable al propio rol", async () => {
    const preferencias = new FakePreferenciaNotificacionRepository();
    await actualizarPreferencia(
      { preferencias },
      "u1",
      Rol.COLABORADOR,
      TipoNotificacion.NUEVA_ACTIVIDAD,
      "EMAIL",
      false,
    );
    expect(preferencias.items[0].emailActivo).toBe(false);
  });

  it("rechaza categorías ajenas al rol", async () => {
    const preferencias = new FakePreferenciaNotificacionRepository();
    await expect(
      actualizarPreferencia(
        { preferencias },
        "u1",
        Rol.COLABORADOR,
        TipoNotificacion.NUEVO_ADMIN_PENDIENTE,
        "EMAIL",
        false,
      ),
    ).rejects.toThrow("no está disponible");
    expect(preferencias.items).toHaveLength(0);
  });
});
