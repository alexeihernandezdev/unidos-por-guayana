import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryActividadRepository } from "@/modules/actividades/application/fakes";
import { crearActividad } from "@/modules/actividades/application/crearActividad";
import { avanzarEstado } from "@/modules/actividades/application/avanzarEstado";
import { ActividadNoEncontradaError } from "@/modules/actividades/application/errors";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { crearAporte } from "./crearAporte";
import type { AporteDeps } from "./deps";
import {
  ActividadNoAceptaAportesError,
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

  const ayudasRepo = new InMemoryActividadRepository();
  const ayuda = await crearActividad(
    { actividades: ayudasRepo, recursos },
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
    actividades: ayudasRepo,
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
      actividadId: ayuda.id,
      recursoId: agua.id,
      colaboradorId: COLABORADOR_ID,
      cantidad: 20,
      nota: " lo llevo el sábado ",
    });
    expect(aporte.estado).toBe("COMPROMETIDO");
    expect(aporte.cantidad).toBe(20);
    expect(aporte.nota).toBe("lo llevo el sábado");
  });

  it("propaga esAnonimo al aporte creado", async () => {
    const { deps, ayuda, agua } = ctx;
    const anonimo = await crearAporte(deps, {
      actividadId: ayuda.id,
      recursoId: agua.id,
      colaboradorId: COLABORADOR_ID,
      cantidad: 3,
      esAnonimo: true,
    });
    expect(anonimo.esAnonimo).toBe(true);

    const normal = await crearAporte(deps, {
      actividadId: ayuda.id,
      recursoId: agua.id,
      colaboradorId: COLABORADOR_ID,
      cantidad: 4,
    });
    expect(normal.esAnonimo).toBe(false);
  });

  it("rechaza cantidad no positiva", async () => {
    const { deps, ayuda, agua } = ctx;
    await expect(
      crearAporte(deps, {
        actividadId: ayuda.id,
        recursoId: agua.id,
        colaboradorId: COLABORADOR_ID,
        cantidad: 0,
      }),
    ).rejects.toBeInstanceOf(DatosAporteInvalidosError);
  });

  it("rechaza un recurso fuera de las metas de la Actividad", async () => {
    const { deps, ayuda, arroz } = ctx;
    await expect(
      crearAporte(deps, {
        actividadId: ayuda.id,
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
        actividadId: ayuda.id,
        recursoId: agua.id,
        colaboradorId: COLABORADOR_ID,
        cantidad: 5,
      }),
    ).rejects.toBeInstanceOf(RecursoFueraDeMetasError);
  });

  it("rechaza si la Actividad ya no está en RECOLECTANDO", async () => {
    const { deps, ayuda, agua } = ctx;
    await avanzarEstado(deps, ayuda.id, "admin-1"); // → LISTO

    await expect(
      crearAporte(deps, {
        actividadId: ayuda.id,
        recursoId: agua.id,
        colaboradorId: COLABORADOR_ID,
        cantidad: 5,
      }),
    ).rejects.toBeInstanceOf(ActividadNoAceptaAportesError);
  });

  it("rechaza si la Actividad no existe", async () => {
    const { deps, agua } = ctx;
    await expect(
      crearAporte(deps, {
        actividadId: "no-existe",
        recursoId: agua.id,
        colaboradorId: COLABORADOR_ID,
        cantidad: 5,
      }),
    ).rejects.toBeInstanceOf(ActividadNoEncontradaError);
  });
});
