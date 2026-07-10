import { beforeEach, describe, expect, it } from "vitest";
import { crearAyuda } from "@/modules/ayudas/application/crearAyuda";
import { InMemoryAyudaRepository } from "@/modules/ayudas/application/fakes";
import { avanzarEstado } from "@/modules/ayudas/application/avanzarEstado";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { contarAyudasPorEstado } from "./contarAyudasPorEstado";

describe("contarAyudasPorEstado", () => {
  const ayudas = new InMemoryAyudaRepository();
  const recursos = new InMemoryRecursoRepository();
  const deps = { ayudas, recursos };

  beforeEach(async () => {
    ayudas["porId"].clear();
    const agua = await recursos.crear({
      nombre: "Agua",
      unidad: "L",
      categoria: CategoriaRecurso.SUMINISTRO,
      descripcion: null,
    });
    await crearAyuda(deps, {
      titulo: "A",
      sectorDestino: "Upata",
      fecha: new Date("2026-08-01"),
      metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
    });
    const b = await crearAyuda(deps, {
      titulo: "B",
      sectorDestino: "Tumeremo",
      fecha: new Date("2026-08-02"),
      metas: [{ recursoId: agua.id, cantidadObjetivo: 5 }],
    });
    await avanzarEstado(deps, b.id);
  });

  it("agrupa conteos por estado", async () => {
    const conteos = await contarAyudasPorEstado(deps);
    expect(conteos.RECOLECTANDO).toBe(1);
    expect(conteos.LISTO).toBe(1);
    expect(conteos.EN_TRANSITO).toBe(0);
    expect(conteos.ENTREGADO).toBe(0);
  });
});
