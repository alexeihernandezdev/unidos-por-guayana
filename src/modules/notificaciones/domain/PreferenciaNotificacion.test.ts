import { describe, expect, it } from "vitest";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { TipoNotificacion } from "./TipoNotificacion";
import {
  canalActivo,
  preferenciasParaRol,
  tipoAplicaAlRol,
} from "./PreferenciaNotificacion";

describe("preferencias de notificación", () => {
  it("usa ambos canales externos activos cuando no hay fila guardada", () => {
    const [preferencia] = preferenciasParaRol(Rol.AUDITOR, []);
    expect(preferencia).toMatchObject({
      tipo: TipoNotificacion.NUEVA_SOLICITUD_AUDITABLE,
      emailActivo: true,
      whatsappActivo: true,
    });
    expect(canalActivo(undefined, "EMAIL")).toBe(true);
    expect(canalActivo(undefined, "WHATSAPP")).toBe(true);
  });

  it("solo expone categorías aplicables al rol", () => {
    expect(
      tipoAplicaAlRol(TipoNotificacion.NUEVO_ADMIN_PENDIENTE, Rol.SUPERADMIN),
    ).toBe(true);
    expect(
      tipoAplicaAlRol(TipoNotificacion.NUEVO_ADMIN_PENDIENTE, Rol.COLABORADOR),
    ).toBe(false);
  });

  it("respeta una preferencia explícita", () => {
    const [preferencia] = preferenciasParaRol(Rol.AUDITOR, [
      {
        usuarioId: "aud-1",
        tipo: TipoNotificacion.NUEVA_SOLICITUD_AUDITABLE,
        emailActivo: false,
        whatsappActivo: true,
      },
    ]);
    expect(preferencia.emailActivo).toBe(false);
    expect(preferencia.whatsappActivo).toBe(true);
  });
});
