import { describe, expect, it } from "vitest";
import { EstadoAporte } from "./EstadoAporte";
import { progresoDeMeta } from "./progresoDeMeta";

const c = (cantidad: number, estado: EstadoAporte) => ({ cantidad, estado });

describe("progresoDeMeta", () => {
  it("devuelve ceros cuando no hay aportes", () => {
    expect(progresoDeMeta([], 100)).toEqual({
      recibido: 0,
      prometido: 0,
      porcentaje: 0,
    });
  });

  it("no cuenta los COMPROMETIDO al porcentaje", () => {
    const p = progresoDeMeta(
      [c(30, EstadoAporte.COMPROMETIDO), c(20, EstadoAporte.COMPROMETIDO)],
      100,
    );
    expect(p).toEqual({ recibido: 0, prometido: 50, porcentaje: 0 });
  });

  it("suma solo los RECIBIDO al porcentaje", () => {
    const p = progresoDeMeta(
      [
        c(40, EstadoAporte.RECIBIDO),
        c(10, EstadoAporte.RECIBIDO),
        c(25, EstadoAporte.COMPROMETIDO),
      ],
      100,
    );
    expect(p.recibido).toBe(50);
    expect(p.prometido).toBe(25);
    expect(p.porcentaje).toBe(50);
  });

  it("marca 100% cuando se cumple la meta", () => {
    const p = progresoDeMeta([c(100, EstadoAporte.RECIBIDO)], 100);
    expect(p.porcentaje).toBe(100);
  });

  it("permite porcentajes por encima de 100 al superar la meta", () => {
    const p = progresoDeMeta([c(150, EstadoAporte.RECIBIDO)], 100);
    expect(p.porcentaje).toBe(150);
  });

  it("devuelve 0% si cantidadObjetivo no es positiva", () => {
    const p = progresoDeMeta([c(10, EstadoAporte.RECIBIDO)], 0);
    expect(p.porcentaje).toBe(0);
  });
});
