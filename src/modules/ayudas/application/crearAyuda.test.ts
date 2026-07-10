import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import { TipoActividad } from "@/modules/ayudas/domain/TipoActividad";
import { crearAyuda } from "./crearAyuda";
import type { AyudaDeps } from "./deps";
import { DatosAyudaInvalidosError, RecursoInvalidoError } from "./errors";
import { InMemoryAyudaRepository } from "./fakes";

async function crearDeps() {
  const recursos = new InMemoryRecursoRepository();
  const agua = await recursos.crear({
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const alimentos = await recursos.crear({
    nombre: "Alimentos",
    unidad: "cajas",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const archivado = await recursos.crear({
    nombre: "Camión viejo",
    unidad: "vehículos",
    categoria: CategoriaRecurso.TRANSPORTE,
    descripcion: null,
  });
  await recursos.actualizar(archivado.id, { activo: false });

  const deps: AyudaDeps = { ayudas: new InMemoryAyudaRepository(), recursos };
  return { deps, agua, alimentos, archivado };
}

describe("crearAyuda", () => {
  let ctx: Awaited<ReturnType<typeof crearDeps>>;

  beforeEach(async () => {
    ctx = await crearDeps();
  });

  it("crea una ayuda con sus metas y nace en RECOLECTANDO", async () => {
    const { deps, agua, alimentos } = ctx;

    const ayuda = await crearAyuda(deps, {
      titulo: "Envío a Upata",
      sectorDestino: "Upata",
      fecha: new Date("2026-08-01T00:00:00.000Z"),
      tipo: "ENVIO",
      metas: [
        { recursoId: agua.id, cantidadObjetivo: 500 },
        { recursoId: alimentos.id, cantidadObjetivo: 200 },
      ],
    });

    expect(ayuda.id).toBeTruthy();
    expect(ayuda.estado).toBe(EstadoAyuda.RECOLECTANDO);
    expect(ayuda.metas).toHaveLength(2);
    expect(ayuda.metas.map((m) => m.recursoId)).toContain(agua.id);
  });

  it("normaliza título/sector (trim) y descripción vacía a null", async () => {
    const { deps, agua } = ctx;

    const ayuda = await crearAyuda(deps, {
      titulo: "  Envío a Upata  ",
      sectorDestino: "  Upata ",
      fecha: new Date(),
      descripcion: "   ",
      tipo: "ENVIO",
      metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
    });

    expect(ayuda.titulo).toBe("Envío a Upata");
    expect(ayuda.sectorDestino).toBe("Upata");
    expect(ayuda.descripcion).toBeNull();
  });

  it("rechaza un título vacío", async () => {
    const { deps, agua } = ctx;

    await expect(
      crearAyuda(deps, {
        titulo: "   ",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "ENVIO",
        metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
      }),
    ).rejects.toBeInstanceOf(DatosAyudaInvalidosError);
  });

  it("rechaza un sector vacío", async () => {
    const { deps, agua } = ctx;

    await expect(
      crearAyuda(deps, {
        titulo: "Envío",
        sectorDestino: "  ",
        fecha: new Date(),
        tipo: "ENVIO",
        metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
      }),
    ).rejects.toBeInstanceOf(DatosAyudaInvalidosError);
  });

  it("exige al menos una meta", async () => {
    const { deps } = ctx;

    await expect(
      crearAyuda(deps, {
        titulo: "Envío",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "ENVIO",
        metas: [],
      }),
    ).rejects.toBeInstanceOf(DatosAyudaInvalidosError);
  });

  it("rechaza recursos repetidos en las metas", async () => {
    const { deps, agua } = ctx;

    await expect(
      crearAyuda(deps, {
        titulo: "Envío",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "ENVIO",
        metas: [
          { recursoId: agua.id, cantidadObjetivo: 10 },
          { recursoId: agua.id, cantidadObjetivo: 20 },
        ],
      }),
    ).rejects.toBeInstanceOf(DatosAyudaInvalidosError);
  });

  it("rechaza una cantidad objetivo no positiva", async () => {
    const { deps, agua } = ctx;

    await expect(
      crearAyuda(deps, {
        titulo: "Envío",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "ENVIO",
        metas: [{ recursoId: agua.id, cantidadObjetivo: 0 }],
      }),
    ).rejects.toBeInstanceOf(DatosAyudaInvalidosError);
  });

  it("rechaza una meta con recurso inexistente", async () => {
    const { deps } = ctx;

    await expect(
      crearAyuda(deps, {
        titulo: "Envío",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "ENVIO",
        metas: [{ recursoId: "no-existe", cantidadObjetivo: 10 }],
      }),
    ).rejects.toBeInstanceOf(RecursoInvalidoError);
  });

  it("rechaza una meta con recurso archivado", async () => {
    const { deps, archivado } = ctx;

    await expect(
      crearAyuda(deps, {
        titulo: "Envío",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "ENVIO",
        metas: [{ recursoId: archivado.id, cantidadObjetivo: 1 }],
      }),
    ).rejects.toBeInstanceOf(RecursoInvalidoError);
  });

  it("acepta cualquier tipo de actividad (envío, jornada, evento social)", async () => {
    const { deps, agua } = ctx;

    const jornada = await crearAyuda(deps, {
      titulo: "Jornada de salud",
      sectorDestino: "Upata",
      fecha: new Date("2026-09-01"),
      tipo: TipoActividad.JORNADA,
      metas: [{ recursoId: agua.id, cantidadObjetivo: 5 }],
    });
    const evento = await crearAyuda(deps, {
      titulo: "Feria comunitaria",
      sectorDestino: "San Félix",
      fecha: new Date("2026-09-02"),
      tipo: TipoActividad.EVENTO_SOCIAL,
      metas: [{ recursoId: agua.id, cantidadObjetivo: 5 }],
    });

    expect(jornada.tipo).toBe(TipoActividad.JORNADA);
    expect(evento.tipo).toBe(TipoActividad.EVENTO_SOCIAL);
  });

  it("rechaza un tipo de actividad inválido", async () => {
    const { deps, agua } = ctx;

    await expect(
      crearAyuda(deps, {
        titulo: "Envío",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "FIESTA" as TipoActividad,
        metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
      }),
    ).rejects.toBeInstanceOf(DatosAyudaInvalidosError);
  });
});
