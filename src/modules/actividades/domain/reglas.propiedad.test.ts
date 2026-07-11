import { describe, expect, it } from "vitest";
import type { Actividad } from "./Actividad";
import { esDueño } from "./reglas";

describe("esDueño", () => {
  const actividad = { adminId: "admin-1" } as Pick<Actividad, "adminId">;

  it("es true cuando el solicitante es el dueño", () => {
    expect(esDueño(actividad, "admin-1")).toBe(true);
  });

  it("es false cuando el solicitante no es el dueño", () => {
    expect(esDueño(actividad, "admin-2")).toBe(false);
  });
});
