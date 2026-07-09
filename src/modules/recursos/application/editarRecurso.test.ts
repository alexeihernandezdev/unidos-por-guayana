import { describe, expect, it } from "vitest";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { crearRecurso } from "./crearRecurso";
import { editarRecurso } from "./editarRecurso";
import {
  DatosRecursoInvalidosError,
  NombreDuplicadoError,
  RecursoNoEncontradoError,
} from "./errors";
import { InMemoryRecursoRepository } from "./fakes";

function crearDeps() {
  return { recursos: new InMemoryRecursoRepository() };
}

describe("editarRecurso", () => {
  it("actualiza los campos indicados", async () => {
    const deps = crearDeps();
    const recurso = await crearRecurso(deps, {
      nombre: "Agua",
      unidad: "litros",
      categoria: CategoriaRecurso.SUMINISTRO,
    });

    const editado = await editarRecurso(deps, recurso.id, {
      unidad: "botellones",
      categoria: CategoriaRecurso.MONETARIO,
      descripcion: "Nueva descripción",
    });

    expect(editado.unidad).toBe("botellones");
    expect(editado.categoria).toBe(CategoriaRecurso.MONETARIO);
    expect(editado.descripcion).toBe("Nueva descripción");
    expect(editado.nombre).toBe("Agua");
  });

  it("permite renombrar con el mismo nombre (distinto casing) sin chocar consigo mismo", async () => {
    const deps = crearDeps();
    const recurso = await crearRecurso(deps, {
      nombre: "Agua",
      unidad: "litros",
      categoria: CategoriaRecurso.SUMINISTRO,
    });

    const editado = await editarRecurso(deps, recurso.id, { nombre: "  AGUA " });

    expect(editado.nombre).toBe("AGUA");
  });

  it("rechaza renombrar a un nombre ya usado por otro recurso", async () => {
    const deps = crearDeps();
    await crearRecurso(deps, {
      nombre: "Agua",
      unidad: "litros",
      categoria: CategoriaRecurso.SUMINISTRO,
    });
    const otro = await crearRecurso(deps, {
      nombre: "Arroz",
      unidad: "kg",
      categoria: CategoriaRecurso.SUMINISTRO,
    });

    await expect(
      editarRecurso(deps, otro.id, { nombre: " agua " }),
    ).rejects.toBeInstanceOf(NombreDuplicadoError);
  });

  it("rechaza una categoría inválida", async () => {
    const deps = crearDeps();
    const recurso = await crearRecurso(deps, {
      nombre: "Agua",
      unidad: "litros",
      categoria: CategoriaRecurso.SUMINISTRO,
    });

    await expect(
      editarRecurso(deps, recurso.id, {
        categoria: "OTRA" as CategoriaRecurso,
      }),
    ).rejects.toBeInstanceOf(DatosRecursoInvalidosError);
  });

  it("rechaza editar un recurso inexistente", async () => {
    const deps = crearDeps();

    await expect(
      editarRecurso(deps, "no-existe", { unidad: "kg" }),
    ).rejects.toBeInstanceOf(RecursoNoEncontradoError);
  });
});
