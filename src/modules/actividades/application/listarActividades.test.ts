import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import { crearActividad } from "./crearActividad";
import { avanzarEstado } from "./avanzarEstado";
import type { ActividadDeps } from "./deps";
import { InMemoryActividadRepository } from "./fakes";
import { listarActividades } from "./listarActividades";

const ADMIN_A = "admin-1";
const ADMIN_B = "admin-2";

async function crearDeps() {
  const recursos = new InMemoryRecursoRepository();
  const agua = await recursos.crear({
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const deps: ActividadDeps = { actividades: new InMemoryActividadRepository(), recursos };
  return { deps, agua };
}

describe("listarActividades", () => {
  let ctx: Awaited<ReturnType<typeof crearDeps>>;

  beforeEach(async () => {
    ctx = await crearDeps();
    const { deps, agua } = ctx;
    await crearActividad(deps, {
      adminId: ADMIN_A,
      titulo: "Envío A",
      sectorDestino: "Upata",
      fecha: new Date("2026-08-01"),
      tipo: TipoActividad.ENVIO,
      metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
    });
    const envioAvanzado = await crearActividad(deps, {
      adminId: ADMIN_A,
      titulo: "Envío B",
      sectorDestino: "Tumeremo",
      fecha: new Date("2026-08-02"),
      tipo: TipoActividad.ENVIO,
      metas: [{ recursoId: agua.id, cantidadObjetivo: 5 }],
    });
    await avanzarEstado(deps, envioAvanzado.id, ADMIN_A);
    await crearActividad(deps, {
      adminId: ADMIN_A,
      titulo: "Jornada",
      sectorDestino: "San Félix",
      fecha: new Date("2026-08-03"),
      tipo: TipoActividad.JORNADA,
      metas: [{ recursoId: agua.id, cantidadObjetivo: 3 }],
    });
    await crearActividad(deps, {
      adminId: ADMIN_A,
      titulo: "Evento",
      sectorDestino: "Ciudad Bolívar",
      fecha: new Date("2026-08-04"),
      tipo: TipoActividad.EVENTO_SOCIAL,
      metas: [{ recursoId: agua.id, cantidadObjetivo: 1 }],
    });
    await crearActividad(deps, {
      adminId: ADMIN_B,
      titulo: "Envío de otro admin",
      sectorDestino: "Guasipati",
      fecha: new Date("2026-08-05"),
      tipo: TipoActividad.ENVIO,
      metas: [{ recursoId: agua.id, cantidadObjetivo: 2 }],
    });
  });

  it("sin filtro de dueño devuelve todas las actividades (red completa)", async () => {
    const todas = await listarActividades(ctx.deps);
    expect(todas).toHaveLength(5);
  });

  it("filtra por adminId (solo las del dueño)", async () => {
    const propias = await listarActividades(ctx.deps, { adminId: ADMIN_A });
    expect(propias).toHaveLength(4);
    expect(propias.every((a) => a.adminId === ADMIN_A)).toBe(true);

    const ajenas = await listarActividades(ctx.deps, { adminId: ADMIN_B });
    expect(ajenas).toHaveLength(1);
    expect(ajenas[0]!.titulo).toBe("Envío de otro admin");
  });

  it("filtra por tipo de actividad", async () => {
    const jornadas = await listarActividades(ctx.deps, {
      tipo: TipoActividad.JORNADA,
    });
    expect(jornadas).toHaveLength(1);
    expect(jornadas[0]!.titulo).toBe("Jornada");
  });

  it("busca por texto en título o destino sin distinguir mayúsculas", async () => {
    const porTitulo = await listarActividades(ctx.deps, { texto: "evento" });
    expect(porTitulo).toHaveLength(1);
    expect(porTitulo[0]!.titulo).toBe("Evento");

    const porDestino = await listarActividades(ctx.deps, { texto: "TUMEREMO" });
    expect(porDestino).toHaveLength(1);
    expect(porDestino[0]!.titulo).toBe("Envío B");
  });

  it("combina filtro de adminId, tipo y estado", async () => {
    const envioRecolectando = await listarActividades(ctx.deps, {
      adminId: ADMIN_A,
      tipo: TipoActividad.ENVIO,
      estado: EstadoActividad.RECOLECTANDO,
    });
    expect(envioRecolectando).toHaveLength(1);
    expect(envioRecolectando[0]!.titulo).toBe("Envío A");
  });
});
