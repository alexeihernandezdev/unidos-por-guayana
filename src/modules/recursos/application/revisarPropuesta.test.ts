import { describe, expect, it } from "vitest";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoAprobacionRecurso } from "@/modules/recursos/domain/EstadoAprobacionRecurso";
import { crearRecurso } from "./crearRecurso";
import {
  PropuestaNoEncontradaError,
  TransicionAprobacionInvalidaError,
} from "./errors";
import { InMemoryRecursoRepository } from "./fakes";
import { proponerRecurso } from "./proponerRecurso";
import { aprobarPropuesta, rechazarPropuesta } from "./revisarPropuesta";

const SOLICITANTE_ID = "solicitante-1";

function crearDeps() {
  return { recursos: new InMemoryRecursoRepository() };
}

async function proponerAlgo(deps: ReturnType<typeof crearDeps>) {
  return proponerRecurso(
    deps,
    {
      nombre: "Ibuprofeno 400mg",
      unidad: "cajas",
      categoria: CategoriaRecurso.SUMINISTRO,
    },
    SOLICITANTE_ID,
  );
}

describe("aprobarPropuesta", () => {
  it("mueve un PROPUESTO a APROBADO", async () => {
    const deps = crearDeps();
    const propuesta = await proponerAlgo(deps);

    const aprobado = await aprobarPropuesta(deps, propuesta.id);

    expect(aprobado.estadoAprobacion).toBe(EstadoAprobacionRecurso.APROBADO);
  });

  it("rechaza aprobar un recurso ya APROBADO", async () => {
    const deps = crearDeps();
    const aprobado = await crearRecurso(deps, {
      nombre: "Agua",
      unidad: "litros",
      categoria: CategoriaRecurso.SUMINISTRO,
    });

    await expect(aprobarPropuesta(deps, aprobado.id)).rejects.toBeInstanceOf(
      TransicionAprobacionInvalidaError,
    );
  });

  it("rechaza aprobar un id inexistente", async () => {
    const deps = crearDeps();

    await expect(aprobarPropuesta(deps, "no-existe")).rejects.toBeInstanceOf(
      PropuestaNoEncontradaError,
    );
  });
});

describe("rechazarPropuesta", () => {
  it("mueve un PROPUESTO a RECHAZADO", async () => {
    const deps = crearDeps();
    const propuesta = await proponerAlgo(deps);

    const rechazado = await rechazarPropuesta(deps, propuesta.id);

    expect(rechazado.estadoAprobacion).toBe(EstadoAprobacionRecurso.RECHAZADO);
  });

  it("no permite volver a mover un RECHAZADO", async () => {
    const deps = crearDeps();
    const propuesta = await proponerAlgo(deps);
    await rechazarPropuesta(deps, propuesta.id);

    await expect(aprobarPropuesta(deps, propuesta.id)).rejects.toBeInstanceOf(
      TransicionAprobacionInvalidaError,
    );
  });
});
