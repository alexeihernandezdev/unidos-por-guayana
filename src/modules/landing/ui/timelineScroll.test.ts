import { describe, expect, it } from "vitest";
import {
  calcularFotograma,
  interpolar,
  limitarProgreso,
} from "./timelineScroll";

describe("timelineScroll", () => {
  it("limita el progreso al rango de la secuencia", () => {
    expect(limitarProgreso(-0.4)).toBe(0);
    expect(limitarProgreso(0.35)).toBe(0.35);
    expect(limitarProgreso(1.4)).toBe(1);
    expect(limitarProgreso(Number.NaN)).toBe(0);
  });

  it("convierte el progreso en una posición de fotograma", () => {
    expect(calcularFotograma(0, 120)).toBe(0);
    expect(calcularFotograma(0.5, 120)).toBe(59.5);
    expect(calcularFotograma(1, 120)).toBe(119);
  });

  it("tolera totales inválidos devolviendo el primer fotograma", () => {
    expect(calcularFotograma(0.5, 0)).toBe(0);
    expect(calcularFotograma(0.5, -10)).toBe(0);
    expect(calcularFotograma(0.5, 12.5)).toBe(0);
    expect(calcularFotograma(0.5, Number.NaN)).toBe(0);
  });

  it("interpola de forma amortiguada hacia el objetivo", () => {
    expect(interpolar(0, 10, 0.5)).toBe(5);
    expect(interpolar(0, 10, 1)).toBe(10);
    expect(interpolar(5, 5, 0.2)).toBe(5);
  });

  it("restringe el factor de interpolación a 0..1", () => {
    expect(interpolar(0, 10, 2)).toBe(10);
    expect(interpolar(0, 10, -1)).toBe(0);
  });

  it("tolera valores no finitos en la interpolación", () => {
    expect(interpolar(Number.NaN, 10, 0.5)).toBe(10);
    expect(interpolar(0, Number.NaN, 0.5)).toBe(0);
  });
});
