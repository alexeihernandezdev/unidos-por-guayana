import { describe, expect, it } from "vitest";
import { EstadoSolicitud } from "./EstadoSolicitud";
import {
  esEditable,
  puedeCerrar,
  puedeMarcarAtendida,
} from "./maquinaEstados";

describe("maquinaEstados solicitudes", () => {
  it("permite marcar atendida solo desde ABIERTA", () => {
    expect(puedeMarcarAtendida(EstadoSolicitud.ABIERTA)).toBe(true);
    expect(puedeMarcarAtendida(EstadoSolicitud.ATENDIDA)).toBe(false);
    expect(puedeMarcarAtendida(EstadoSolicitud.CERRADA)).toBe(false);
  });

  it("permite cerrar solo desde ABIERTA", () => {
    expect(puedeCerrar(EstadoSolicitud.ABIERTA)).toBe(true);
    expect(puedeCerrar(EstadoSolicitud.ATENDIDA)).toBe(false);
    expect(puedeCerrar(EstadoSolicitud.CERRADA)).toBe(false);
  });

  it("es editable solo en ABIERTA", () => {
    expect(esEditable(EstadoSolicitud.ABIERTA)).toBe(true);
    expect(esEditable(EstadoSolicitud.ATENDIDA)).toBe(false);
    expect(esEditable(EstadoSolicitud.CERRADA)).toBe(false);
  });
});
