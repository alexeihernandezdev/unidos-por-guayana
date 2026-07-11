import { describe, expect, it } from "vitest";
import type { Ayuda } from "./Ayuda";
import { esDueño } from "./reglas";

describe("esDueño", () => {
  const ayuda = { adminId: "admin-1" } as Pick<Ayuda, "adminId">;

  it("es true cuando el solicitante es el dueño", () => {
    expect(esDueño(ayuda, "admin-1")).toBe(true);
  });

  it("es false cuando el solicitante no es el dueño", () => {
    expect(esDueño(ayuda, "admin-2")).toBe(false);
  });
});
