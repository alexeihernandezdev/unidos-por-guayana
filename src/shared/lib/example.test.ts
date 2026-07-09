import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { create } from "zustand";
import { useForm } from "react-hook-form";
import { greet } from "@/shared/lib/example";

describe("configuración base (test de humo)", () => {
  it("resuelve el alias @/… e importa desde shared", () => {
    expect(greet("Guayana")).toBe("Hola, Guayana");
  });

  it("carga librerías instaladas (luxon)", () => {
    const date = DateTime.fromISO("2026-07-08");
    expect(date.isValid).toBe(true);
    expect(date.year).toBe(2026);
  });

  it("resuelve zustand (store mínimo)", () => {
    const useCounter = create<{ n: number; inc: () => void }>((set) => ({
      n: 0,
      inc: () => set((s) => ({ n: s.n + 1 })),
    }));
    useCounter.getState().inc();
    expect(useCounter.getState().n).toBe(1);
  });

  it("resuelve react-hook-form", () => {
    expect(typeof useForm).toBe("function");
  });
});
