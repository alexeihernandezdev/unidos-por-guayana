import { describe, expect, it } from "vitest";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoAprobacionRecurso } from "@/modules/recursos/domain/EstadoAprobacionRecurso";
import { crearRecurso } from "./crearRecurso";
import { DatosRecursoInvalidosError, NombreDuplicadoError } from "./errors";
import { InMemoryRecursoRepository } from "./fakes";
import { proponerRecurso } from "./proponerRecurso";

const SOLICITANTE_ID = "usuario-solicitante-1";

function crearDeps() {
  return { recursos: new InMemoryRecursoRepository() };
}

describe("proponerRecurso", () => {
  it("crea el recurso en PROPUESTO con propuestoPorId", async () => {
    const deps = crearDeps();

    const recurso = await proponerRecurso(
      deps,
      {
        nombre: "Mascarillas KN95",
        unidad: "unidades",
        categoria: CategoriaRecurso.SUMINISTRO,
      },
      SOLICITANTE_ID,
    );

    expect(recurso.estadoAprobacion).toBe(EstadoAprobacionRecurso.PROPUESTO);
    expect(recurso.propuestoPorId).toBe(SOLICITANTE_ID);
    expect(recurso.activo).toBe(true);
  });

  it("normaliza nombre (trim)", async () => {
    const deps = crearDeps();

    const recurso = await proponerRecurso(
      deps,
      {
        nombre: "  Alcohol  ",
        unidad: "litros",
        categoria: CategoriaRecurso.SUMINISTRO,
      },
      SOLICITANTE_ID,
    );

    expect(recurso.nombre).toBe("Alcohol");
  });

  it("rechaza un nombre duplicado (insensible a mayúsculas)", async () => {
    const deps = crearDeps();
    await crearRecurso(deps, {
      nombre: "Agua",
      unidad: "litros",
      categoria: CategoriaRecurso.SUMINISTRO,
    });

    await expect(
      proponerRecurso(
        deps,
        {
          nombre: "  agua ",
          unidad: "botellas",
          categoria: CategoriaRecurso.SUMINISTRO,
        },
        SOLICITANTE_ID,
      ),
    ).rejects.toBeInstanceOf(NombreDuplicadoError);
  });

  it("rechaza unidad vacía", async () => {
    const deps = crearDeps();

    await expect(
      proponerRecurso(
        deps,
        {
          nombre: "Guantes",
          unidad: "  ",
          categoria: CategoriaRecurso.SUMINISTRO,
        },
        SOLICITANTE_ID,
      ),
    ).rejects.toBeInstanceOf(DatosRecursoInvalidosError);
  });

  it("rechaza categoría inválida", async () => {
    const deps = crearDeps();

    await expect(
      proponerRecurso(
        deps,
        {
          nombre: "Guantes",
          unidad: "cajas",
          categoria: "OTRA" as CategoriaRecurso,
        },
        SOLICITANTE_ID,
      ),
    ).rejects.toBeInstanceOf(DatosRecursoInvalidosError);
  });
});
