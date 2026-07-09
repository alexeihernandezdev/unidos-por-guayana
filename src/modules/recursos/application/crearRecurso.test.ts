import { describe, expect, it } from "vitest";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { crearRecurso, type CrearRecursoInput } from "./crearRecurso";
import { DatosRecursoInvalidosError, NombreDuplicadoError } from "./errors";
import { InMemoryRecursoRepository } from "./fakes";

function crearDeps() {
  return { recursos: new InMemoryRecursoRepository() };
}

const baseInput: CrearRecursoInput = {
  nombre: "Agua",
  unidad: "litros",
  categoria: CategoriaRecurso.SUMINISTRO,
  descripcion: "Agua potable",
};

describe("crearRecurso", () => {
  it("crea un recurso y nace activo", async () => {
    const deps = crearDeps();

    const recurso = await crearRecurso(deps, baseInput);

    expect(recurso.id).toBeTruthy();
    expect(recurso.nombre).toBe("Agua");
    expect(recurso.unidad).toBe("litros");
    expect(recurso.categoria).toBe(CategoriaRecurso.SUMINISTRO);
    expect(recurso.activo).toBe(true);
  });

  it("normaliza el nombre y la unidad (trim), guardando el nombre tal cual", async () => {
    const deps = crearDeps();

    const recurso = await crearRecurso(deps, {
      ...baseInput,
      nombre: "  Agua Mineral  ",
      unidad: "  cajas ",
    });

    expect(recurso.nombre).toBe("Agua Mineral");
    expect(recurso.unidad).toBe("cajas");
  });

  it("rechaza un nombre duplicado (insensible a mayúsculas y espacios)", async () => {
    const deps = crearDeps();
    await crearRecurso(deps, baseInput);

    await expect(
      crearRecurso(deps, { ...baseInput, nombre: "  agua " }),
    ).rejects.toBeInstanceOf(NombreDuplicadoError);
  });

  it("rechaza una categoría inválida", async () => {
    const deps = crearDeps();

    await expect(
      crearRecurso(deps, {
        ...baseInput,
        categoria: "OTRA" as CategoriaRecurso,
      }),
    ).rejects.toBeInstanceOf(DatosRecursoInvalidosError);
  });

  it("rechaza un nombre vacío", async () => {
    const deps = crearDeps();

    await expect(
      crearRecurso(deps, { ...baseInput, nombre: "   " }),
    ).rejects.toBeInstanceOf(DatosRecursoInvalidosError);
  });

  it("rechaza una unidad vacía", async () => {
    const deps = crearDeps();

    await expect(
      crearRecurso(deps, { ...baseInput, unidad: "  " }),
    ).rejects.toBeInstanceOf(DatosRecursoInvalidosError);
  });

  it("convierte una descripción vacía en null", async () => {
    const deps = crearDeps();

    const recurso = await crearRecurso(deps, {
      ...baseInput,
      descripcion: "   ",
    });

    expect(recurso.descripcion).toBeNull();
  });
});
