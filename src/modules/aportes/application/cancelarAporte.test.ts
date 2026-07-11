import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryActividadRepository } from "@/modules/actividades/application/fakes";
import { crearActividad } from "@/modules/actividades/application/crearActividad";
import { avanzarEstado } from "@/modules/actividades/application/avanzarEstado";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { cancelarAporte } from "./cancelarAporte";
import { crearAporte } from "./crearAporte";
import { marcarRecibido } from "./marcarRecibido";
import type { AporteDeps } from "./deps";
import {
  ActividadNoAceptaAportesError,
  NoAutorizadoError,
  TransicionInvalidaError,
} from "./errors";
import { InMemoryAporteRepository } from "./fakes";

const COL = { id: "col-1", rol: Rol.COLABORADOR } as const;
const OTRO = { id: "col-2", rol: Rol.COLABORADOR } as const;
const ADMIN = { id: "admin-1", rol: Rol.ADMIN } as const;

async function armarConAporte() {
  const recursos = new InMemoryRecursoRepository();
  const agua = await recursos.crear({
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const ayudasRepo = new InMemoryActividadRepository();
  const ayuda = await crearActividad(
    { actividades: ayudasRepo, recursos },
    {
      adminId: "admin-1",
      titulo: "Envío",
      sectorDestino: "Upata",
      fecha: new Date(),
      tipo: "ENVIO",
      metas: [{ recursoId: agua.id, cantidadObjetivo: 100 }],
    },
  );
  const deps: AporteDeps = {
    aportes: new InMemoryAporteRepository(),
    actividades: ayudasRepo,
    recursos,
  };
  const aporte = await crearAporte(deps, {
    actividadId: ayuda.id,
    recursoId: agua.id,
    colaboradorId: COL.id,
    cantidad: 10,
  });
  return { deps, ayuda, aporte };
}

describe("cancelarAporte", () => {
  let ctx: Awaited<ReturnType<typeof armarConAporte>>;

  beforeEach(async () => {
    ctx = await armarConAporte();
  });

  it("el dueño puede cancelar su aporte COMPROMETIDO", async () => {
    const { deps, aporte } = ctx;
    await cancelarAporte(deps, aporte.id, COL);
    expect(await deps.aportes.buscarPorId(aporte.id)).toBeNull();
  });

  it("un ADMIN puede cancelar el aporte de otro", async () => {
    const { deps, aporte } = ctx;
    await cancelarAporte(deps, aporte.id, ADMIN);
    expect(await deps.aportes.buscarPorId(aporte.id)).toBeNull();
  });

  it("otro colaborador no puede cancelar", async () => {
    const { deps, aporte } = ctx;
    await expect(
      cancelarAporte(deps, aporte.id, OTRO),
    ).rejects.toBeInstanceOf(NoAutorizadoError);
  });

  it("no se puede cancelar un aporte RECIBIDO", async () => {
    const { deps, aporte } = ctx;
    await marcarRecibido(deps, aporte.id, ADMIN);
    await expect(
      cancelarAporte(deps, aporte.id, ADMIN),
    ).rejects.toBeInstanceOf(TransicionInvalidaError);
  });

  it("no se puede cancelar si la Actividad ya no está en RECOLECTANDO", async () => {
    const { deps, aporte, ayuda } = ctx;
    await avanzarEstado(deps, ayuda.id, "admin-1"); // → LISTO
    await expect(
      cancelarAporte(deps, aporte.id, COL),
    ).rejects.toBeInstanceOf(ActividadNoAceptaAportesError);
  });
});
