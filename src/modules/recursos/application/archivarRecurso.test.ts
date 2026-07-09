import { describe, expect, it } from "vitest";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { activarRecurso, archivarRecurso } from "./archivarRecurso";
import { crearRecurso } from "./crearRecurso";
import { RecursoNoEncontradoError } from "./errors";
import { InMemoryRecursoRepository } from "./fakes";

function crearDeps() {
  return { recursos: new InMemoryRecursoRepository() };
}

async function crearAgua(deps: ReturnType<typeof crearDeps>) {
  return crearRecurso(deps, {
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
  });
}

describe("archivarRecurso / activarRecurso", () => {
  it("archivar pone activo = false", async () => {
    const deps = crearDeps();
    const recurso = await crearAgua(deps);

    const archivado = await archivarRecurso(deps, recurso.id);

    expect(archivado.activo).toBe(false);
  });

  it("activar vuelve a poner activo = true", async () => {
    const deps = crearDeps();
    const recurso = await crearAgua(deps);
    await archivarRecurso(deps, recurso.id);

    const activado = await activarRecurso(deps, recurso.id);

    expect(activado.activo).toBe(true);
  });

  it("rechaza archivar un recurso inexistente", async () => {
    const deps = crearDeps();

    await expect(archivarRecurso(deps, "no-existe")).rejects.toBeInstanceOf(
      RecursoNoEncontradoError,
    );
  });
});
