import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import { TipoActividad } from "@/modules/ayudas/domain/TipoActividad";
import { crearAyuda } from "./crearAyuda";
import { avanzarEstado } from "./avanzarEstado";
import type { AyudaDeps } from "./deps";
import { InMemoryAyudaRepository } from "./fakes";
import { listarAyudas } from "./listarAyudas";

async function crearDeps() {
  const recursos = new InMemoryRecursoRepository();
  const agua = await recursos.crear({
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const deps: AyudaDeps = { ayudas: new InMemoryAyudaRepository(), recursos };
  return { deps, agua };
}

describe("listarAyudas", () => {
  let ctx: Awaited<ReturnType<typeof crearDeps>>;

  beforeEach(async () => {
    ctx = await crearDeps();
    const { deps, agua } = ctx;
    await crearAyuda(deps, {
      titulo: "Envío A",
      sectorDestino: "Upata",
      fecha: new Date("2026-08-01"),
      tipo: TipoActividad.ENVIO,
      metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
    });
    const envioAvanzado = await crearAyuda(deps, {
      titulo: "Envío B",
      sectorDestino: "Tumeremo",
      fecha: new Date("2026-08-02"),
      tipo: TipoActividad.ENVIO,
      metas: [{ recursoId: agua.id, cantidadObjetivo: 5 }],
    });
    await avanzarEstado(deps, envioAvanzado.id);
    await crearAyuda(deps, {
      titulo: "Jornada",
      sectorDestino: "San Félix",
      fecha: new Date("2026-08-03"),
      tipo: TipoActividad.JORNADA,
      metas: [{ recursoId: agua.id, cantidadObjetivo: 3 }],
    });
    await crearAyuda(deps, {
      titulo: "Evento",
      sectorDestino: "Ciudad Bolívar",
      fecha: new Date("2026-08-04"),
      tipo: TipoActividad.EVENTO_SOCIAL,
      metas: [{ recursoId: agua.id, cantidadObjetivo: 1 }],
    });
  });

  it("sin filtro devuelve todas las ayudas", async () => {
    const todas = await listarAyudas(ctx.deps);
    expect(todas).toHaveLength(4);
  });

  it("filtra por tipo de actividad", async () => {
    const jornadas = await listarAyudas(ctx.deps, {
      tipo: TipoActividad.JORNADA,
    });
    expect(jornadas).toHaveLength(1);
    expect(jornadas[0]!.titulo).toBe("Jornada");
  });

  it("combina filtro de tipo y estado", async () => {
    const envioRecolectando = await listarAyudas(ctx.deps, {
      tipo: TipoActividad.ENVIO,
      estado: EstadoAyuda.RECOLECTANDO,
    });
    expect(envioRecolectando).toHaveLength(1);
    expect(envioRecolectando[0]!.titulo).toBe("Envío A");
  });
});
