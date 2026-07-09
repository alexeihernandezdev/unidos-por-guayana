import { describe, expect, it } from "vitest";
import { EstadoAporte } from "./EstadoAporte";
import {
  puedeCancelar,
  puedeMarcarRecibido,
  puedeRevertir,
} from "./maquinaEstados";

describe("máquina de estados del Aporte", () => {
  it("permite marcar como recibido solo desde COMPROMETIDO", () => {
    expect(puedeMarcarRecibido(EstadoAporte.COMPROMETIDO)).toBe(true);
    expect(puedeMarcarRecibido(EstadoAporte.RECIBIDO)).toBe(false);
  });

  it("permite cancelar solo si sigue COMPROMETIDO", () => {
    expect(puedeCancelar(EstadoAporte.COMPROMETIDO)).toBe(true);
    expect(puedeCancelar(EstadoAporte.RECIBIDO)).toBe(false);
  });

  it("permite revertir solo desde RECIBIDO", () => {
    expect(puedeRevertir(EstadoAporte.RECIBIDO)).toBe(true);
    expect(puedeRevertir(EstadoAporte.COMPROMETIDO)).toBe(false);
  });
});
