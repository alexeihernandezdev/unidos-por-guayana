import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import { avanzarEstado } from "./avanzarEstado";
import { crearAyuda } from "./crearAyuda";
import type { AyudaDeps } from "./deps";
import { AyudaNoEncontradaError, TransicionInvalidaError } from "./errors";
import { InMemoryAyudaRepository } from "./fakes";

async function crearAyudaBase() {
  const recursos = new InMemoryRecursoRepository();
  const agua = await recursos.crear({
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const deps: AyudaDeps = { ayudas: new InMemoryAyudaRepository(), recursos };
  const ayuda = await crearAyuda(deps, {
    titulo: "Envío",
    sectorDestino: "Upata",
    fecha: new Date(),
    metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
  });
  return { deps, ayuda };
}

describe("avanzarEstado", () => {
  let ctx: Awaited<ReturnType<typeof crearAyudaBase>>;

  beforeEach(async () => {
    ctx = await crearAyudaBase();
  });

  it("avanza por toda la secuencia válida hasta ENTREGADO", async () => {
    const { deps, ayuda } = ctx;

    const listo = await avanzarEstado(deps, ayuda.id);
    expect(listo.estado).toBe(EstadoAyuda.LISTO);

    const enTransito = await avanzarEstado(deps, ayuda.id);
    expect(enTransito.estado).toBe(EstadoAyuda.EN_TRANSITO);

    const entregado = await avanzarEstado(deps, ayuda.id);
    expect(entregado.estado).toBe(EstadoAyuda.ENTREGADO);
  });

  it("rechaza avanzar desde el estado terminal ENTREGADO", async () => {
    const { deps, ayuda } = ctx;
    await avanzarEstado(deps, ayuda.id);
    await avanzarEstado(deps, ayuda.id);
    await avanzarEstado(deps, ayuda.id);

    await expect(avanzarEstado(deps, ayuda.id)).rejects.toBeInstanceOf(
      TransicionInvalidaError,
    );
  });

  it("rechaza avanzar una ayuda inexistente", async () => {
    const { deps } = ctx;

    await expect(avanzarEstado(deps, "no-existe")).rejects.toBeInstanceOf(
      AyudaNoEncontradaError,
    );
  });
});
