import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import { avanzarEstado } from "./avanzarEstado";
import { crearAyuda } from "./crearAyuda";
import type { AyudaDeps } from "./deps";
import {
  ActividadNoPerteneceAlAdminError,
  AyudaNoEncontradaError,
  TransicionInvalidaError,
} from "./errors";
import { InMemoryAyudaRepository } from "./fakes";

const ADMIN = "admin-1";
const OTRO_ADMIN = "admin-2";

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
    adminId: ADMIN,
    titulo: "Envío",
    sectorDestino: "Upata",
    fecha: new Date(),
    tipo: "ENVIO",
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

    const listo = await avanzarEstado(deps, ayuda.id, ADMIN);
    expect(listo.estado).toBe(EstadoAyuda.LISTO);

    const enTransito = await avanzarEstado(deps, ayuda.id, ADMIN);
    expect(enTransito.estado).toBe(EstadoAyuda.EN_TRANSITO);

    const entregado = await avanzarEstado(deps, ayuda.id, ADMIN);
    expect(entregado.estado).toBe(EstadoAyuda.ENTREGADO);
  });

  it("rechaza avanzar desde el estado terminal ENTREGADO", async () => {
    const { deps, ayuda } = ctx;
    await avanzarEstado(deps, ayuda.id, ADMIN);
    await avanzarEstado(deps, ayuda.id, ADMIN);
    await avanzarEstado(deps, ayuda.id, ADMIN);

    await expect(avanzarEstado(deps, ayuda.id, ADMIN)).rejects.toBeInstanceOf(
      TransicionInvalidaError,
    );
  });

  it("rechaza avanzar una ayuda inexistente", async () => {
    const { deps } = ctx;

    await expect(
      avanzarEstado(deps, "no-existe", ADMIN),
    ).rejects.toBeInstanceOf(AyudaNoEncontradaError);
  });

  it("rechaza avanzar una actividad de otro administrador", async () => {
    const { deps, ayuda } = ctx;

    await expect(
      avanzarEstado(deps, ayuda.id, OTRO_ADMIN),
    ).rejects.toBeInstanceOf(ActividadNoPerteneceAlAdminError);
  });
});
