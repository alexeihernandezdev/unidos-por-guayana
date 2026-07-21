import { describe, expect, it } from "vitest";
import { crearSolicitud } from "@/modules/solicitudes/application/crearSolicitud";
import { contarSolicitudesAbiertasPorSector } from "./contarSolicitudesAbiertasPorSector";
import { InMemorySolicitudRepository } from "./fakes";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";

describe("contarSolicitudesAbiertasPorSector", () => {
  it("cuenta por sector normalizado", async () => {
    const recursos = new InMemoryRecursoRepository();
    const agua = await recursos.crear({
      nombre: "Agua",
      unidad: "L",
      categoria: CategoriaRecurso.SUMINISTRO,
      descripcion: null,
    });
    const deps = {
      solicitudes: new InMemorySolicitudRepository(),
      recursos,
    };
    const base = {
      urgencia: UrgenciaSolicitud.ALTA,
      descripcion: "Actividad",
      recursos: [{ recursoId: agua.id, cantidadEstimada: 3 }],
    };
    await crearSolicitud(deps, { ...base, sector: "Upata Centro" }, "sol-1");
    await crearSolicitud(deps, { ...base, sector: " upata centro " }, "sol-1");

    expect(
      await contarSolicitudesAbiertasPorSector(deps, "Upata Centro"),
    ).toBe(2);
  });
});
