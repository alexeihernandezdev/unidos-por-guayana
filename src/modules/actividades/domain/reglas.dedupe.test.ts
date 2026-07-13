import { describe, expect, it } from "vitest";
import { dedupeIds } from "./reglas";

describe("dedupeIds (feature 026)", () => {
  it("elimina duplicados conservando el primer orden", () => {
    expect(dedupeIds(["a", "b", "a", "c", "b"])).toEqual(["a", "b", "c"]);
  });

  it("recorta espacios y descarta vacíos", () => {
    expect(dedupeIds([" a ", "", "  ", "b"])).toEqual(["a", "b"]);
  });

  it("trata como iguales ids que solo difieren en espacios", () => {
    expect(dedupeIds(["a", " a"])).toEqual(["a"]);
  });

  it("devuelve vacío para lista vacía", () => {
    expect(dedupeIds([])).toEqual([]);
  });
});
