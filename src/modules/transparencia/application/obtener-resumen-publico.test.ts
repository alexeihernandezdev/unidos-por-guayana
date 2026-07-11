import { beforeEach, describe, expect, it } from "vitest";
import { crearAporte } from "@/modules/aportes/application/crearAporte";
import { marcarRecibido } from "@/modules/aportes/application/marcarRecibido";
import { InMemoryAporteRepository } from "@/modules/aportes/application/fakes";
import { avanzarEstado } from "@/modules/actividades/application/avanzarEstado";
import { crearActividad } from "@/modules/actividades/application/crearActividad";
import { InMemoryActividadRepository } from "@/modules/actividades/application/fakes";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  assertSinDatosPersonales,
  obtenerResumenPublico,
} from "./obtener-resumen-publico";

describe("obtenerResumenPublico", () => {
  let aguaId: string;
  let usdId: string;
  const actividades = new InMemoryActividadRepository();
  const recursos = new InMemoryRecursoRepository();
  const aportes = new InMemoryAporteRepository();
  const deps = { actividades, recursos, aportes };

  beforeEach(async () => {
    actividades["porId"].clear();
    aportes["porId"].clear();
    recursos["porId"].clear();
    const agua = await recursos.crear({
      nombre: "Agua",
      unidad: "L",
      categoria: CategoriaRecurso.SUMINISTRO,
      descripcion: null,
    });
    const usd = await recursos.crear({
      nombre: "Donación USD",
      unidad: "USD",
      categoria: CategoriaRecurso.MONETARIO,
      descripcion: null,
    });
    aguaId = agua.id;
    usdId = usd.id;
  });

  it("compone totales, recolectado y envíos ordenados por fecha desc", async () => {
    const antigua = await crearActividad(deps, {
      adminId: "admin-1",
      titulo: "Antigua",
      sectorDestino: "A",
      fecha: new Date("2026-08-01"),
      tipo: "ENVIO",
      metas: [
        { recursoId: aguaId, cantidadObjetivo: 100 },
        { recursoId: usdId, cantidadObjetivo: 500 },
      ],
    });
    const reciente = await crearActividad(deps, {
      adminId: "admin-1",
      titulo: "Reciente",
      sectorDestino: "B",
      fecha: new Date("2026-09-01"),
      tipo: "JORNADA",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 50 }],
    });
    const aporte = await crearAporte(deps, {
      actividadId: reciente.id,
      recursoId: aguaId,
      colaboradorId: "col-secreto",
      cantidad: 25,
      nota: "contacto@secreto.test",
    });
    const usdAporte = await crearAporte(deps, {
      actividadId: antigua.id,
      recursoId: usdId,
      colaboradorId: "col-otro",
      cantidad: 200,
    });
    await marcarRecibido(deps, aporte.id, { id: "admin", rol: Rol.ADMIN });
    await marcarRecibido(deps, usdAporte.id, { id: "admin", rol: Rol.ADMIN });
    await avanzarEstado(deps, antigua.id, "admin-1");
    await avanzarEstado(deps, antigua.id, "admin-1");
    await avanzarEstado(deps, antigua.id, "admin-1");

    const resumen = await obtenerResumenPublico(deps);

    expect(resumen.totales.enviosTotal).toBe(2);
    expect(resumen.totales.enviosEntregados).toBe(1);
    expect(resumen.totales.aportesConfirmados).toBe(2);
    expect(resumen.recolectadoPorRecurso).toHaveLength(2);
    expect(
      resumen.recolectadoPorRecurso.find((r) => r.categoria === "MONETARIO")
        ?.unidad,
    ).toBe("USD");
    expect(resumen.envios[0]?.titulo).toBe("Reciente");
    expect(resumen.envios[0]?.porcentaje).toBe(50);
    assertSinDatosPersonales(resumen);
  });

  it("no incluye campos personales en el JSON del DTO", async () => {
    await crearActividad(deps, {
      adminId: "admin-1",
      titulo: "Solo cabecera",
      sectorDestino: "C",
      fecha: new Date("2026-09-10"),
      tipo: "EVENTO_SOCIAL",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 10 }],
    });
    const resumen = await obtenerResumenPublico(deps);
    const json = JSON.stringify(resumen);
    expect(json).not.toContain("col-secreto");
    expect(json).not.toContain("contacto@secreto");
    assertSinDatosPersonales(resumen);
  });
});
