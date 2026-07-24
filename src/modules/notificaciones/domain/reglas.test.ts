import { describe, expect, it } from "vitest";
import {
  claveDedupe,
  componerMensaje,
  contarNoLeidas,
  variablesPlantilla,
} from "./reglas";
import type { Notificacion } from "./Notificacion";
import type { EventoNotificacion } from "./NotificadorPort";
import { TipoNotificacion } from "./TipoNotificacion";

const nuevaActividad: EventoNotificacion = {
  tipo: TipoNotificacion.NUEVA_ACTIVIDAD,
  actividadId: "act-1",
  sectorDestino: "Catia La Mar",
  destinatarioIds: ["u1", "u2"],
};

const metaCumplida: EventoNotificacion = {
  tipo: TipoNotificacion.META_CUMPLIDA,
  actividadId: "act-1",
  sectorDestino: "Catia La Mar",
  recursoId: "rec-agua",
  recursoNombre: "agua",
  destinatarioIds: ["admin-1", "u1"],
};

const SIN_GUION_LARGO = /[—–]/;

describe("componerMensaje", () => {
  it("compone el texto de NUEVA_ACTIVIDAD sin guion largo", () => {
    const mensaje = componerMensaje(nuevaActividad);
    expect(mensaje).toBe("Nueva actividad en Catia La Mar necesita recursos.");
    expect(mensaje).not.toMatch(SIN_GUION_LARGO);
  });

  it("compone el texto de META_CUMPLIDA sin guion largo", () => {
    const mensaje = componerMensaje(metaCumplida);
    expect(mensaje).toBe(
      "Meta de agua cumplida en la actividad de Catia La Mar.",
    );
    expect(mensaje).not.toMatch(SIN_GUION_LARGO);
  });
});

describe("variablesPlantilla", () => {
  it("devuelve el sector para NUEVA_ACTIVIDAD", () => {
    expect(variablesPlantilla(nuevaActividad)).toEqual(["Catia La Mar"]);
  });

  it("devuelve recurso y sector para META_CUMPLIDA", () => {
    expect(variablesPlantilla(metaCumplida)).toEqual(["agua", "Catia La Mar"]);
  });
});

describe("claveDedupe", () => {
  it("es estable por actividad para NUEVA_ACTIVIDAD", () => {
    expect(claveDedupe(nuevaActividad)).toBe(
      "NUEVA_ACTIVIDAD:ACTIVIDAD:act-1",
    );
  });

  it("distingue por recurso en META_CUMPLIDA", () => {
    expect(claveDedupe(metaCumplida)).toBe(
      "META_CUMPLIDA:ACTIVIDAD:act-1:rec-agua",
    );
    expect(
      claveDedupe({ ...metaCumplida, recursoId: "rec-arroz" }),
    ).not.toBe(claveDedupe(metaCumplida));
  });
});

describe("contarNoLeidas", () => {
  it("cuenta solo las no leídas", () => {
    const base = (leida: boolean): Notificacion => ({
      id: "x",
      usuarioId: "u1",
      tipo: TipoNotificacion.NUEVA_ACTIVIDAD,
      mensaje: "m",
      referenciaTipo: "ACTIVIDAD",
      referenciaId: "a",
      leida,
      claveDedupe: "k",
      createdAt: new Date(),
    });
    expect(
      contarNoLeidas([base(false), base(true), base(false)]),
    ).toBe(2);
    expect(contarNoLeidas([])).toBe(0);
  });
});
