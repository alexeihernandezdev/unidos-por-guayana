import { describe, expect, it } from "vitest";
import { EstadoActividad } from "./EstadoActividad";
import { TipoActividad } from "./TipoActividad";
import {
  esEditable,
  esEliminable,
  puedeAvanzar,
  remapearAEstadoEvento,
  secuenciaDe,
  siguienteEstado,
} from "./maquinaEstados";

describe("máquina de estados de la Actividad · ENVIO", () => {
  const tipo = TipoActividad.ENVIO;

  it("avanza RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO", () => {
    expect(siguienteEstado(tipo, EstadoActividad.RECOLECTANDO)).toBe(
      EstadoActividad.LISTO,
    );
    expect(siguienteEstado(tipo, EstadoActividad.LISTO)).toBe(
      EstadoActividad.EN_TRANSITO,
    );
    expect(siguienteEstado(tipo, EstadoActividad.EN_TRANSITO)).toBe(
      EstadoActividad.ENTREGADO,
    );
  });

  it("ENTREGADO es terminal", () => {
    expect(siguienteEstado(tipo, EstadoActividad.ENTREGADO)).toBeNull();
  });

  it("acepta solo el paso inmediato y rechaza saltos/retrocesos", () => {
    expect(puedeAvanzar(tipo, EstadoActividad.RECOLECTANDO, EstadoActividad.LISTO)).toBe(true);
    expect(puedeAvanzar(tipo, EstadoActividad.RECOLECTANDO, EstadoActividad.ENTREGADO)).toBe(false);
    expect(puedeAvanzar(tipo, EstadoActividad.LISTO, EstadoActividad.RECOLECTANDO)).toBe(false);
    expect(puedeAvanzar(tipo, EstadoActividad.ENTREGADO, EstadoActividad.EN_TRANSITO)).toBe(false);
  });

  it("rechaza transiciones hacia estados de la secuencia de eventos", () => {
    expect(puedeAvanzar(tipo, EstadoActividad.RECOLECTANDO, EstadoActividad.LISTA)).toBe(false);
  });
});

describe("máquina de estados de la Actividad · JORNADA / EVENTO_SOCIAL", () => {
  for (const tipo of [TipoActividad.JORNADA, TipoActividad.EVENTO_SOCIAL]) {
    it(`avanza RECOLECTANDO → LISTA → EN_CURSO → REALIZADA (${tipo})`, () => {
      expect(siguienteEstado(tipo, EstadoActividad.RECOLECTANDO)).toBe(
        EstadoActividad.LISTA,
      );
      expect(siguienteEstado(tipo, EstadoActividad.LISTA)).toBe(
        EstadoActividad.EN_CURSO,
      );
      expect(siguienteEstado(tipo, EstadoActividad.EN_CURSO)).toBe(
        EstadoActividad.REALIZADA,
      );
      expect(siguienteEstado(tipo, EstadoActividad.REALIZADA)).toBeNull();
    });

    it(`rechaza el vocabulario de envío y los saltos (${tipo})`, () => {
      expect(puedeAvanzar(tipo, EstadoActividad.RECOLECTANDO, EstadoActividad.LISTO)).toBe(false);
      expect(puedeAvanzar(tipo, EstadoActividad.RECOLECTANDO, EstadoActividad.REALIZADA)).toBe(false);
      expect(puedeAvanzar(tipo, EstadoActividad.EN_CURSO, EstadoActividad.LISTA)).toBe(false);
    });
  }
});

describe("secuenciaDe", () => {
  it("ENVIO usa la secuencia física; los demás la de eventos", () => {
    expect(secuenciaDe(TipoActividad.ENVIO)).toEqual([
      EstadoActividad.RECOLECTANDO,
      EstadoActividad.LISTO,
      EstadoActividad.EN_TRANSITO,
      EstadoActividad.ENTREGADO,
    ]);
    expect(secuenciaDe(TipoActividad.JORNADA)).toEqual([
      EstadoActividad.RECOLECTANDO,
      EstadoActividad.LISTA,
      EstadoActividad.EN_CURSO,
      EstadoActividad.REALIZADA,
    ]);
  });
});

describe("edición y eliminación", () => {
  it("solo permite editar y eliminar en RECOLECTANDO", () => {
    expect(esEditable(EstadoActividad.RECOLECTANDO)).toBe(true);
    expect(esEliminable(EstadoActividad.RECOLECTANDO)).toBe(true);
    for (const estado of [
      EstadoActividad.LISTO,
      EstadoActividad.EN_TRANSITO,
      EstadoActividad.ENTREGADO,
      EstadoActividad.LISTA,
      EstadoActividad.EN_CURSO,
      EstadoActividad.REALIZADA,
    ]) {
      expect(esEditable(estado)).toBe(false);
      expect(esEliminable(estado)).toBe(false);
    }
  });
});

describe("remapearAEstadoEvento (backfill feature 024)", () => {
  it("remapea por posición LISTO→LISTA, EN_TRANSITO→EN_CURSO, ENTREGADO→REALIZADA", () => {
    expect(remapearAEstadoEvento(EstadoActividad.LISTO)).toBe(EstadoActividad.LISTA);
    expect(remapearAEstadoEvento(EstadoActividad.EN_TRANSITO)).toBe(EstadoActividad.EN_CURSO);
    expect(remapearAEstadoEvento(EstadoActividad.ENTREGADO)).toBe(EstadoActividad.REALIZADA);
  });

  it("RECOLECTANDO es compartido y no cambia", () => {
    expect(remapearAEstadoEvento(EstadoActividad.RECOLECTANDO)).toBe(
      EstadoActividad.RECOLECTANDO,
    );
  });

  it("es idempotente sobre estados ya de la secuencia de eventos", () => {
    expect(remapearAEstadoEvento(EstadoActividad.LISTA)).toBe(EstadoActividad.LISTA);
    expect(remapearAEstadoEvento(EstadoActividad.REALIZADA)).toBe(EstadoActividad.REALIZADA);
  });
});
