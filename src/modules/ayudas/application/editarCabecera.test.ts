import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { avanzarEstado } from "./avanzarEstado";
import { crearAyuda } from "./crearAyuda";
import type { AyudaDeps } from "./deps";
import { editarCabecera } from "./editarCabecera";
import {
  ActividadNoPerteneceAlAdminError,
  AyudaNoEditableError,
  DatosAyudaInvalidosError,
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
    fecha: new Date("2026-08-01T00:00:00.000Z"),
    tipo: "ENVIO",
    metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
  });
  return { deps, ayuda };
}

describe("editarCabecera", () => {
  let ctx: Awaited<ReturnType<typeof crearAyudaBase>>;

  beforeEach(async () => {
    ctx = await crearAyudaBase();
  });

  it("edita la cabecera mientras la ayuda está en RECOLECTANDO", async () => {
    const { deps, ayuda } = ctx;

    const actualizada = await editarCabecera(deps, ayuda.id, ADMIN, {
      titulo: "  Envío urgente a Upata ",
      sectorDestino: "Upata Norte",
    });

    expect(actualizada.titulo).toBe("Envío urgente a Upata");
    expect(actualizada.sectorDestino).toBe("Upata Norte");
    expect(actualizada.adminId).toBe(ADMIN);
  });

  it("rechaza un título vacío", async () => {
    const { deps, ayuda } = ctx;

    await expect(
      editarCabecera(deps, ayuda.id, ADMIN, { titulo: "   " }),
    ).rejects.toBeInstanceOf(DatosAyudaInvalidosError);
  });

  it("no cambia el tipo ni el dueño al editar la cabecera", async () => {
    const { deps, ayuda } = ctx;

    const actualizada = await editarCabecera(deps, ayuda.id, ADMIN, {
      titulo: "Otro título",
    });

    expect(actualizada.tipo).toBe(ayuda.tipo);
    expect(actualizada.adminId).toBe(ADMIN);
  });

  it("bloquea la edición una vez la ayuda pasa a LISTO", async () => {
    const { deps, ayuda } = ctx;
    await avanzarEstado(deps, ayuda.id, ADMIN);

    await expect(
      editarCabecera(deps, ayuda.id, ADMIN, { titulo: "Otro título" }),
    ).rejects.toBeInstanceOf(AyudaNoEditableError);
  });

  it("rechaza editar una actividad de otro administrador", async () => {
    const { deps, ayuda } = ctx;

    await expect(
      editarCabecera(deps, ayuda.id, OTRO_ADMIN, { titulo: "Hack" }),
    ).rejects.toBeInstanceOf(ActividadNoPerteneceAlAdminError);
  });
});
