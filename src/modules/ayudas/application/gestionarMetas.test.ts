import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { avanzarEstado } from "./avanzarEstado";
import { crearAyuda } from "./crearAyuda";
import type { AyudaDeps } from "./deps";
import {
  ActividadNoPerteneceAlAdminError,
  AyudaNoEditableError,
  DatosAyudaInvalidosError,
  RecursoInvalidoError,
} from "./errors";
import { InMemoryAyudaRepository } from "./fakes";
import { guardarMeta, quitarMeta } from "./gestionarMetas";

const ADMIN = "admin-1";
const OTRO_ADMIN = "admin-2";

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
  const deps: AyudaDeps = { ayudas: new InMemoryAyudaRepository(), recursos };
  const ayuda = await crearAyuda(deps, {
    adminId: ADMIN,
    titulo: "Envío",
    sectorDestino: "Upata",
    fecha: new Date(),
    tipo: "ENVIO",
    metas: [{ recursoId: agua.id, cantidadObjetivo: 500 }],
  });
  return { deps, ayuda, agua, alimentos };
}

describe("gestionarMetas", () => {
  let ctx: Awaited<ReturnType<typeof crearDeps>>;

  beforeEach(async () => {
    ctx = await crearDeps();
  });

  it("añade una meta nueva para un recurso distinto", async () => {
    const { deps, ayuda, alimentos } = ctx;

    const actualizada = await guardarMeta(deps, ayuda.id, ADMIN, {
      recursoId: alimentos.id,
      cantidadObjetivo: 200,
    });

    expect(actualizada.metas).toHaveLength(2);
  });

  it("actualiza el objetivo si el recurso ya tenía meta (upsert, sin duplicar)", async () => {
    const { deps, ayuda, agua } = ctx;

    const actualizada = await guardarMeta(deps, ayuda.id, ADMIN, {
      recursoId: agua.id,
      cantidadObjetivo: 750,
    });

    expect(actualizada.metas).toHaveLength(1);
    expect(actualizada.metas[0]?.cantidadObjetivo).toBe(750);
  });

  it("quita una meta existente", async () => {
    const { deps, ayuda, agua } = ctx;

    const actualizada = await quitarMeta(deps, ayuda.id, ADMIN, agua.id);

    expect(actualizada.metas).toHaveLength(0);
  });

  it("rechaza una cantidad objetivo no positiva", async () => {
    const { deps, ayuda, alimentos } = ctx;

    await expect(
      guardarMeta(deps, ayuda.id, ADMIN, {
        recursoId: alimentos.id,
        cantidadObjetivo: -5,
      }),
    ).rejects.toBeInstanceOf(DatosAyudaInvalidosError);
  });

  it("rechaza un recurso inexistente", async () => {
    const { deps, ayuda } = ctx;

    await expect(
      guardarMeta(deps, ayuda.id, ADMIN, {
        recursoId: "no-existe",
        cantidadObjetivo: 10,
      }),
    ).rejects.toBeInstanceOf(RecursoInvalidoError);
  });

  it("bloquea añadir metas una vez la ayuda pasa a LISTO", async () => {
    const { deps, ayuda, alimentos } = ctx;
    await avanzarEstado(deps, ayuda.id, ADMIN);

    await expect(
      guardarMeta(deps, ayuda.id, ADMIN, {
        recursoId: alimentos.id,
        cantidadObjetivo: 100,
      }),
    ).rejects.toBeInstanceOf(AyudaNoEditableError);
  });

  it("bloquea quitar metas una vez la ayuda pasa a LISTO", async () => {
    const { deps, ayuda, agua } = ctx;
    await avanzarEstado(deps, ayuda.id, ADMIN);

    await expect(
      quitarMeta(deps, ayuda.id, ADMIN, agua.id),
    ).rejects.toBeInstanceOf(AyudaNoEditableError);
  });

  it("rechaza gestionar metas de una actividad ajena", async () => {
    const { deps, ayuda, alimentos } = ctx;

    await expect(
      guardarMeta(deps, ayuda.id, OTRO_ADMIN, {
        recursoId: alimentos.id,
        cantidadObjetivo: 10,
      }),
    ).rejects.toBeInstanceOf(ActividadNoPerteneceAlAdminError);
  });
});
