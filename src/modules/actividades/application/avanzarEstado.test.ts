import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { avanzarEstado } from "./avanzarEstado";
import { crearActividad } from "./crearActividad";
import type { ActividadDeps } from "./deps";
import {
  ActividadNoPerteneceAlAdminError,
  ActividadNoEncontradaError,
  TransicionInvalidaError,
} from "./errors";
import { InMemoryActividadRepository } from "./fakes";

const ADMIN = "admin-1";
const OTRO_ADMIN = "admin-2";

async function crearActividadBase() {
  const recursos = new InMemoryRecursoRepository();
  const agua = await recursos.crear({
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const deps: ActividadDeps = { actividades: new InMemoryActividadRepository(), recursos };
  const ayuda = await crearActividad(deps, {
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
  let ctx: Awaited<ReturnType<typeof crearActividadBase>>;

  beforeEach(async () => {
    ctx = await crearActividadBase();
  });

  it("avanza por toda la secuencia válida hasta ENTREGADO", async () => {
    const { deps, ayuda } = ctx;

    const listo = await avanzarEstado(deps, ayuda.id, ADMIN);
    expect(listo.estado).toBe(EstadoActividad.LISTO);

    const enTransito = await avanzarEstado(deps, ayuda.id, ADMIN);
    expect(enTransito.estado).toBe(EstadoActividad.EN_TRANSITO);

    const entregado = await avanzarEstado(deps, ayuda.id, ADMIN);
    expect(entregado.estado).toBe(EstadoActividad.ENTREGADO);
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
    ).rejects.toBeInstanceOf(ActividadNoEncontradaError);
  });

  it("rechaza avanzar una actividad de otro administrador", async () => {
    const { deps, ayuda } = ctx;

    await expect(
      avanzarEstado(deps, ayuda.id, OTRO_ADMIN),
    ).rejects.toBeInstanceOf(ActividadNoPerteneceAlAdminError);
  });
});
