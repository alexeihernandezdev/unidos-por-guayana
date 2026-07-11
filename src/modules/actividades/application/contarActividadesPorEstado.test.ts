import { beforeEach, describe, expect, it } from "vitest";
import { crearActividad } from "@/modules/actividades/application/crearActividad";
import { InMemoryActividadRepository } from "@/modules/actividades/application/fakes";
import { avanzarEstado } from "@/modules/actividades/application/avanzarEstado";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { contarActividadesPorEstado } from "./contarActividadesPorEstado";

describe("contarActividadesPorEstado", () => {
  const actividades = new InMemoryActividadRepository();
  const recursos = new InMemoryRecursoRepository();
  const deps = { actividades, recursos };

  beforeEach(async () => {
    actividades["porId"].clear();
    const agua = await recursos.crear({
      nombre: "Agua",
      unidad: "L",
      categoria: CategoriaRecurso.SUMINISTRO,
      descripcion: null,
    });
    await crearActividad(deps, {
      adminId: "admin-1",
      titulo: "A",
      sectorDestino: "Upata",
      fecha: new Date("2026-08-01"),
      tipo: "ENVIO",
      metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
    });
    const b = await crearActividad(deps, {
      adminId: "admin-1",
      titulo: "B",
      sectorDestino: "Tumeremo",
      fecha: new Date("2026-08-02"),
      tipo: "ENVIO",
      metas: [{ recursoId: agua.id, cantidadObjetivo: 5 }],
    });
    await avanzarEstado(deps, b.id, "admin-1");
  });

  it("agrupa conteos por estado", async () => {
    const conteos = await contarActividadesPorEstado(deps);
    expect(conteos.RECOLECTANDO).toBe(1);
    expect(conteos.LISTO).toBe(1);
    expect(conteos.EN_TRANSITO).toBe(0);
    expect(conteos.ENTREGADO).toBe(0);
  });

  it("acota conteos por adminId", async () => {
    const agua = await recursos.crear({
      nombre: "Comida",
      unidad: "kg",
      categoria: CategoriaRecurso.SUMINISTRO,
      descripcion: null,
    });
    await crearActividad(deps, {
      adminId: "admin-2",
      titulo: "Ajena",
      sectorDestino: "X",
      fecha: new Date("2026-08-03"),
      tipo: "ENVIO",
      metas: [{ recursoId: agua.id, cantidadObjetivo: 1 }],
    });

    const propias = await contarActividadesPorEstado(deps, { adminId: "admin-1" });
    expect(propias.RECOLECTANDO).toBe(1);
    expect(propias.LISTO).toBe(1);

    const ajenas = await contarActividadesPorEstado(deps, { adminId: "admin-2" });
    expect(ajenas.RECOLECTANDO).toBe(1);
    expect(ajenas.LISTO).toBe(0);
  });
});
