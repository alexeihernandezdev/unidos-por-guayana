import { describe, expect, it } from "vitest";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoAprobacionRecurso } from "@/modules/recursos/domain/EstadoAprobacionRecurso";
import { esSeleccionable } from "@/modules/recursos/domain/reglas";
import { archivarRecurso } from "./archivarRecurso";
import { crearRecurso } from "./crearRecurso";
import { InMemoryRecursoRepository } from "./fakes";
import { listarPropuestas } from "./listarPropuestas";
import { listarRecursos } from "./listarRecursos";
import { proponerRecurso } from "./proponerRecurso";
import { aprobarPropuesta, rechazarPropuesta } from "./revisarPropuesta";

function crearDeps() {
  return { recursos: new InMemoryRecursoRepository() };
}

describe("esSeleccionable (regla de dominio)", () => {
  it("solo devuelve true para APROBADO + activo", () => {
    expect(
      esSeleccionable({
        estadoAprobacion: EstadoAprobacionRecurso.APROBADO,
        activo: true,
      }),
    ).toBe(true);
    expect(
      esSeleccionable({
        estadoAprobacion: EstadoAprobacionRecurso.APROBADO,
        activo: false,
      }),
    ).toBe(false);
    expect(
      esSeleccionable({
        estadoAprobacion: EstadoAprobacionRecurso.PROPUESTO,
        activo: true,
      }),
    ).toBe(false);
    expect(
      esSeleccionable({
        estadoAprobacion: EstadoAprobacionRecurso.RECHAZADO,
        activo: true,
      }),
    ).toBe(false);
  });
});

describe("listarRecursos con soloSeleccionables", () => {
  it("excluye PROPUESTO, RECHAZADO y archivados", async () => {
    const deps = crearDeps();
    const aprobado = await crearRecurso(deps, {
      nombre: "Agua",
      unidad: "litros",
      categoria: CategoriaRecurso.SUMINISTRO,
    });
    const archivado = await crearRecurso(deps, {
      nombre: "Camión viejo",
      unidad: "vehículos",
      categoria: CategoriaRecurso.TRANSPORTE,
    });
    await archivarRecurso(deps, archivado.id);
    const propuesto = await proponerRecurso(
      deps,
      {
        nombre: "Ibuprofeno",
        unidad: "cajas",
        categoria: CategoriaRecurso.SUMINISTRO,
      },
      "solicitante-1",
    );
    const rechazoOrigen = await proponerRecurso(
      deps,
      {
        nombre: "Sillas plegables",
        unidad: "unidades",
        categoria: CategoriaRecurso.SUMINISTRO,
      },
      "solicitante-1",
    );
    await rechazarPropuesta(deps, rechazoOrigen.id);

    const seleccionables = await listarRecursos(deps, {
      soloSeleccionables: true,
    });

    expect(seleccionables.map((r) => r.id)).toEqual([aprobado.id]);
    expect(seleccionables.some((r) => r.id === propuesto.id)).toBe(false);
  });
});

describe("listarPropuestas", () => {
  it("devuelve solo los recursos PROPUESTO", async () => {
    const deps = crearDeps();
    await crearRecurso(deps, {
      nombre: "Agua",
      unidad: "litros",
      categoria: CategoriaRecurso.SUMINISTRO,
    });
    const p1 = await proponerRecurso(
      deps,
      {
        nombre: "Guantes",
        unidad: "cajas",
        categoria: CategoriaRecurso.SUMINISTRO,
      },
      "s-1",
    );
    const p2 = await proponerRecurso(
      deps,
      {
        nombre: "Mascarillas",
        unidad: "cajas",
        categoria: CategoriaRecurso.SUMINISTRO,
      },
      "s-2",
    );
    await aprobarPropuesta(deps, p2.id);

    const propuestas = await listarPropuestas(deps);

    expect(propuestas.map((r) => r.id)).toEqual([p1.id]);
  });
});
