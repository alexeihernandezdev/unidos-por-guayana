import { describe, expect, it } from "vitest";
import { EstadoAyuda } from "./EstadoAyuda";
import {
  esEditable,
  esEliminable,
  puedeAvanzar,
  siguienteEstado,
} from "./maquinaEstados";

describe("máquina de estados de la Ayuda", () => {
  it("avanza en la secuencia válida RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO", () => {
    expect(siguienteEstado(EstadoAyuda.RECOLECTANDO)).toBe(EstadoAyuda.LISTO);
    expect(siguienteEstado(EstadoAyuda.LISTO)).toBe(EstadoAyuda.EN_TRANSITO);
    expect(siguienteEstado(EstadoAyuda.EN_TRANSITO)).toBe(
      EstadoAyuda.ENTREGADO,
    );
  });

  it("ENTREGADO es terminal (sin siguiente estado)", () => {
    expect(siguienteEstado(EstadoAyuda.ENTREGADO)).toBeNull();
  });

  it("acepta solo el paso inmediato como transición válida", () => {
    expect(puedeAvanzar(EstadoAyuda.RECOLECTANDO, EstadoAyuda.LISTO)).toBe(true);
    expect(puedeAvanzar(EstadoAyuda.LISTO, EstadoAyuda.EN_TRANSITO)).toBe(true);
    expect(puedeAvanzar(EstadoAyuda.EN_TRANSITO, EstadoAyuda.ENTREGADO)).toBe(
      true,
    );
  });

  it("rechaza saltos de estado", () => {
    expect(puedeAvanzar(EstadoAyuda.RECOLECTANDO, EstadoAyuda.EN_TRANSITO)).toBe(
      false,
    );
    expect(puedeAvanzar(EstadoAyuda.RECOLECTANDO, EstadoAyuda.ENTREGADO)).toBe(
      false,
    );
    expect(puedeAvanzar(EstadoAyuda.LISTO, EstadoAyuda.ENTREGADO)).toBe(false);
  });

  it("rechaza retrocesos y avanzar desde el estado terminal", () => {
    expect(puedeAvanzar(EstadoAyuda.LISTO, EstadoAyuda.RECOLECTANDO)).toBe(
      false,
    );
    expect(puedeAvanzar(EstadoAyuda.EN_TRANSITO, EstadoAyuda.LISTO)).toBe(false);
    expect(puedeAvanzar(EstadoAyuda.ENTREGADO, EstadoAyuda.EN_TRANSITO)).toBe(
      false,
    );
  });

  it("solo permite editar y eliminar en RECOLECTANDO", () => {
    expect(esEditable(EstadoAyuda.RECOLECTANDO)).toBe(true);
    expect(esEliminable(EstadoAyuda.RECOLECTANDO)).toBe(true);
    for (const estado of [
      EstadoAyuda.LISTO,
      EstadoAyuda.EN_TRANSITO,
      EstadoAyuda.ENTREGADO,
    ]) {
      expect(esEditable(estado)).toBe(false);
      expect(esEliminable(estado)).toBe(false);
    }
  });
});
