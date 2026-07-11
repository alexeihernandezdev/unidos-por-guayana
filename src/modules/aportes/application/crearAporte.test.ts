import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAyudaRepository } from "@/modules/ayudas/application/fakes";
import { crearAyuda } from "@/modules/ayudas/application/crearAyuda";
import { avanzarEstado } from "@/modules/ayudas/application/avanzarEstado";
import { AyudaNoEncontradaError } from "@/modules/ayudas/application/errors";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { crearAporte } from "./crearAporte";
import type { AporteDeps } from "./deps";
import {
  AyudaNoAceptaAportesError,
  DatosAporteInvalidosError,
  RecursoFueraDeMetasError,
} from "./errors";
import { InMemoryAporteRepository } from "./fakes";

const COLABORADOR_ID = "user-col-1";

async function armarContexto() {
  const recursos = new InMemoryRecursoRepository();
  const agua = await recursos.crear({
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const arroz = await recursos.crear({
    nombre: "Arroz",
    unidad: "kg",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });

  const ayudasRepo = new InMemoryAyudaRepository();
  const ayuda = await crearAyuda(
    { ayudas: ayudasRepo, recursos },
    {
      adminId: "admin-1",
      titulo: "Envío 1",
      sectorDestino: "Upata",
      fecha: new Date(),
      tipo: "ENVIO",
      metas: [{ recursoId: agua.id, cantidadObjetivo: 100 }],
    },
  );

  const deps: AporteDeps = {
    aportes: new InMemoryAporteRepository(),
    ayudas: ayudasRepo,
    recursos,
  };
  return { deps, ayuda, agua, arroz };
}

describe("crearAporte", () => {
  let ctx: Awaited<ReturnType<typeof armarContexto>>;

  beforeEach(async () => {
    ctx = await armarContexto();
  });

  it("crea el aporte en estado COMPROMETIDO", async () => {
    const { deps, ayuda, agua } = ctx;
    const aporte = await crearAporte(deps, {
      ayudaId: ayuda.id,
      recursoId: agua.id,
      colaboradorId: COLABORADOR_ID,
      cantidad: 20,
      nota: " lo llevo el sábado ",
    });
    expect(aporte.estado).toBe("COMPROMETIDO");
    expect(aporte.cantidad).toBe(20);
    expect(aporte.nota).toBe("lo llevo el sábado");
  });

  it("rechaza cantidad no positiva", async () => {
    const { deps, ayuda, agua } = ctx;
    await expect(
      crearAporte(deps, {
        ayudaId: ayuda.id,
        recursoId: agua.id,
        colaboradorId: COLABORADOR_ID,
        cantidad: 0,
      }),
    ).rejects.toBeInstanceOf(DatosAporteInvalidosError);
  });

  it("rechaza un recurso fuera de las metas de la Ayuda", async () => {
    const { deps, ayuda, arroz } = ctx;
    await expect(
      crearAporte(deps, {
        ayudaId: ayuda.id,
        recursoId: arroz.id,
        colaboradorId: COLABORADOR_ID,
        cantidad: 5,
      }),
    ).rejects.toBeInstanceOf(RecursoFueraDeMetasError);
  });

  it("rechaza un recurso archivado", async () => {
    const { deps, ayuda, agua } = ctx;
    await deps.recursos.actualizar(agua.id, { activo: false });

    await expect(
      crearAporte(deps, {
        ayudaId: ayuda.id,
        recursoId: agua.id,
        colaboradorId: COLABORADOR_ID,
        cantidad: 5,
      }),
    ).rejects.toBeInstanceOf(RecursoFueraDeMetasError);
  });

  it("rechaza si la Ayuda ya no está en RECOLECTANDO", async () => {
    const { deps, ayuda, agua } = ctx;
    await avanzarEstado(deps, ayuda.id, "admin-1"); // → LISTO

    await expect(
      crearAporte(deps, {
        ayudaId: ayuda.id,
        recursoId: agua.id,
        colaboradorId: COLABORADOR_ID,
        cantidad: 5,
      }),
    ).rejects.toBeInstanceOf(AyudaNoAceptaAportesError);
  });

  it("rechaza si la Ayuda no existe", async () => {
    const { deps, agua } = ctx;
    await expect(
      crearAporte(deps, {
        ayudaId: "no-existe",
        recursoId: agua.id,
        colaboradorId: COLABORADOR_ID,
        cantidad: 5,
      }),
    ).rejects.toBeInstanceOf(AyudaNoEncontradaError);
  });
});
