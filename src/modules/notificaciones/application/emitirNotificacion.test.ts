import { describe, expect, it } from "vitest";
import type { ContactoDestinatario } from "@/modules/notificaciones/domain/Notificacion";
import type { EventoNotificacion } from "@/modules/notificaciones/domain/NotificadorPort";
import { TipoNotificacion } from "@/modules/notificaciones/domain/TipoNotificacion";
import { emitirNotificacion } from "./emitirNotificacion";
import {
  FakeCanalWhatsApp,
  FakeLectorContacto,
  FakeNotificacionRepository,
} from "./fakes";

function armar(contactos: ContactoDestinatario[] = []) {
  const notificaciones = new FakeNotificacionRepository();
  const canalWhatsApp = new FakeCanalWhatsApp();
  const contactosLector = new FakeLectorContacto(contactos);
  return {
    deps: { notificaciones, contactos: contactosLector, canalWhatsApp },
    notificaciones,
    canalWhatsApp,
  };
}

const eventoNuevaActividad: EventoNotificacion = {
  tipo: TipoNotificacion.NUEVA_ACTIVIDAD,
  actividadId: "act-1",
  sectorDestino: "Catia La Mar",
  destinatarioIds: ["u1", "u2"],
};

describe("emitirNotificacion", () => {
  it("crea una notificación in-app por cada destinatario", async () => {
    const { deps, notificaciones } = armar();
    await emitirNotificacion(deps, eventoNuevaActividad);

    expect(notificaciones.items).toHaveLength(2);
    expect(notificaciones.items.map((n) => n.usuarioId).sort()).toEqual([
      "u1",
      "u2",
    ]);
    expect(notificaciones.items[0].mensaje).toContain("Catia La Mar");
  });

  it("no crea nada si no hay destinatarios", async () => {
    const { deps, notificaciones } = armar();
    await emitirNotificacion(deps, {
      ...eventoNuevaActividad,
      destinatarioIds: [],
    });
    expect(notificaciones.items).toHaveLength(0);
  });

  it("deduplica: reintentar el mismo evento no crea un segundo aviso", async () => {
    const { deps, notificaciones } = armar();
    await emitirNotificacion(deps, eventoNuevaActividad);
    await emitirNotificacion(deps, eventoNuevaActividad);
    expect(notificaciones.items).toHaveLength(2);
  });

  it("solo crea para destinatarios nuevos si se amplía la lista", async () => {
    const { deps, notificaciones } = armar();
    await emitirNotificacion(deps, eventoNuevaActividad);
    await emitirNotificacion(deps, {
      ...eventoNuevaActividad,
      destinatarioIds: ["u1", "u2", "u3"],
    });
    expect(notificaciones.items).toHaveLength(3);
  });

  it("envía WhatsApp solo a destinatarios con telefonoEsWhatsApp y teléfono", async () => {
    const { deps, canalWhatsApp } = armar([
      { usuarioId: "u1", telefono: "+584121234567", telefonoEsWhatsApp: true },
      { usuarioId: "u2", telefono: "+584141234567", telefonoEsWhatsApp: false },
    ]);
    await emitirNotificacion(deps, eventoNuevaActividad);

    expect(canalWhatsApp.enviados).toHaveLength(1);
    expect(canalWhatsApp.enviados[0].telefonoE164).toBe("+584121234567");
    expect(canalWhatsApp.enviados[0].variables).toEqual(["Catia La Mar"]);
  });

  it("no reenvía WhatsApp a quien ya tenía la notificación", async () => {
    const { deps, canalWhatsApp } = armar([
      { usuarioId: "u1", telefono: "+584121234567", telefonoEsWhatsApp: true },
    ]);
    await emitirNotificacion(deps, eventoNuevaActividad);
    await emitirNotificacion(deps, eventoNuevaActividad);
    expect(canalWhatsApp.enviados).toHaveLength(1);
  });

  it("un fallo de WhatsApp no impide el aviso in-app ni propaga error", async () => {
    const { deps, notificaciones, canalWhatsApp } = armar([
      { usuarioId: "u1", telefono: "+584121234567", telefonoEsWhatsApp: true },
    ]);
    canalWhatsApp.fallar = true;
    await expect(
      emitirNotificacion(deps, eventoNuevaActividad),
    ).resolves.toBeUndefined();
    expect(notificaciones.items).toHaveLength(2);
  });
});
