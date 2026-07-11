import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryActividadRepository } from "@/modules/actividades/application/fakes";
import { crearActividad } from "@/modules/actividades/application/crearActividad";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { crearAporte } from "./crearAporte";
import { marcarRecibido } from "./marcarRecibido";
import { revertirRecibido } from "./revertirRecibido";
import type { AporteDeps } from "./deps";
import { NoAutorizadoError, TransicionInvalidaError } from "./errors";
import { InMemoryAporteRepository } from "./fakes";

const COL = { id: "col-1", rol: Rol.COLABORADOR } as const;
const ADMIN = { id: "admin-1", rol: Rol.ADMIN } as const;

async function armar() {
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
  return { deps, aporte };
}

describe("marcarRecibido", () => {
  let ctx: Awaited<ReturnType<typeof armar>>;
  beforeEach(async () => {
    ctx = await armar();
  });

  it("un ADMIN marca RECIBIDO y setea recibidoEn", async () => {
    const { deps, aporte } = ctx;
    const actualizado = await marcarRecibido(deps, aporte.id, ADMIN);
    expect(actualizado.estado).toBe("RECIBIDO");
    expect(actualizado.recibidoEn).toBeInstanceOf(Date);
  });

  it("un COLABORADOR no puede marcar RECIBIDO", async () => {
    const { deps, aporte } = ctx;
    await expect(
      marcarRecibido(deps, aporte.id, COL),
    ).rejects.toBeInstanceOf(NoAutorizadoError);
  });

  it("no se puede marcar RECIBIDO dos veces", async () => {
    const { deps, aporte } = ctx;
    await marcarRecibido(deps, aporte.id, ADMIN);
    await expect(
      marcarRecibido(deps, aporte.id, ADMIN),
    ).rejects.toBeInstanceOf(TransicionInvalidaError);
  });
});

describe("revertirRecibido", () => {
  let ctx: Awaited<ReturnType<typeof armar>>;
  beforeEach(async () => {
    ctx = await armar();
  });

  it("un ADMIN revierte RECIBIDO → COMPROMETIDO y limpia recibidoEn", async () => {
    const { deps, aporte } = ctx;
    await marcarRecibido(deps, aporte.id, ADMIN);
    const revertido = await revertirRecibido(deps, aporte.id, ADMIN);
    expect(revertido.estado).toBe("COMPROMETIDO");
    expect(revertido.recibidoEn).toBeNull();
  });

  it("no se revierte un aporte que sigue COMPROMETIDO", async () => {
    const { deps, aporte } = ctx;
    await expect(
      revertirRecibido(deps, aporte.id, ADMIN),
    ).rejects.toBeInstanceOf(TransicionInvalidaError);
  });

  it("un COLABORADOR no puede revertir", async () => {
    const { deps, aporte } = ctx;
    await marcarRecibido(deps, aporte.id, ADMIN);
    await expect(
      revertirRecibido(deps, aporte.id, COL),
    ).rejects.toBeInstanceOf(NoAutorizadoError);
  });
});
