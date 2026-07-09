import { describe, expect, it } from "vitest";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { archivarRecurso } from "./archivarRecurso";
import { crearRecurso } from "./crearRecurso";
import { InMemoryRecursoRepository } from "./fakes";
import { listarRecursos } from "./listarRecursos";

function crearDeps() {
  return { recursos: new InMemoryRecursoRepository() };
}

async function poblar(deps: ReturnType<typeof crearDeps>) {
  const agua = await crearRecurso(deps, {
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
  });
  await crearRecurso(deps, {
    nombre: "Camión",
    unidad: "vehículos",
    categoria: CategoriaRecurso.TRANSPORTE,
  });
  return { agua };
}

describe("listarRecursos", () => {
  it("sin filtro devuelve todos (incluidos los archivados)", async () => {
    const deps = crearDeps();
    const { agua } = await poblar(deps);
    await archivarRecurso(deps, agua.id);

    const recursos = await listarRecursos(deps);

    expect(recursos).toHaveLength(2);
  });

  it("filtra por categoría", async () => {
    const deps = crearDeps();
    await poblar(deps);

    const recursos = await listarRecursos(deps, {
      categoria: CategoriaRecurso.TRANSPORTE,
    });

    expect(recursos).toHaveLength(1);
    expect(recursos[0]?.nombre).toBe("Camión");
  });

  it("filtra solo activos (deja fuera los archivados)", async () => {
    const deps = crearDeps();
    const { agua } = await poblar(deps);
    await archivarRecurso(deps, agua.id);

    const recursos = await listarRecursos(deps, { soloActivos: true });

    expect(recursos).toHaveLength(1);
    expect(recursos[0]?.nombre).toBe("Camión");
  });
});
