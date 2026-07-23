import { describe, expect, it } from "vitest";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { derivarPanel } from "./derivarPanel";
import type { EnvioResumenPublico, ResumenPublico } from "./obtener-resumen-publico";

function envio(over: Partial<EnvioResumenPublico>): EnvioResumenPublico {
  return {
    actividadId: over.actividadId ?? "a-1",
    titulo: over.titulo ?? "Actividad",
    sectorDestino: over.sectorDestino ?? "Vargas",
    fecha: over.fecha ?? new Date("2026-07-01"),
    estado: over.estado ?? "RECOLECTANDO",
    tipo: over.tipo ?? "ENVIO",
    porcentaje: over.porcentaje ?? 0,
    portadaUrl: over.portadaUrl ?? null,
  };
}

function resumenCon(envios: EnvioResumenPublico[]): ResumenPublico {
  return {
    totales: {
      enviosTotal: envios.length,
      enviosEntregados: envios.filter((e) => e.estado === "ENTREGADO").length,
      aportesConfirmados: 5,
    },
    recolectadoPorRecurso: [
      {
        recurso: "Agua",
        unidad: "L",
        categoria: CategoriaRecurso.SUMINISTRO,
        cantidadRecibida: 100,
      },
    ],
    envios,
  };
}

describe("derivarPanel", () => {
  it("devuelve el panel vacío coherente cuando no hay actividades", () => {
    const panel = derivarPanel(resumenCon([]));
    expect(panel.kpis.actividades).toBe(0);
    expect(panel.kpis.avancePromedio).toBe(0);
    expect(panel.kpis.sectoresAlcanzados).toBe(0);
    expect(panel.serieMensual).toEqual([]);
    expect(panel.sectores).toEqual([]);
    expect(panel.porTipo.every((t) => t.valor === 0)).toBe(true);
  });

  it("cuenta actividades por tipo respetando el orden canónico", () => {
    const panel = derivarPanel(
      resumenCon([
        envio({ actividadId: "1", tipo: "ENVIO" }),
        envio({ actividadId: "2", tipo: "ENVIO" }),
        envio({ actividadId: "3", tipo: "JORNADA" }),
      ]),
    );
    expect(panel.porTipo).toEqual([
      { tipo: "ENVIO", valor: 2 },
      { tipo: "JORNADA", valor: 1 },
      { tipo: "EVENTO_SOCIAL", valor: 0 },
    ]);
  });

  it("colapsa los estados de ambas secuencias en cuatro fases", () => {
    const panel = derivarPanel(
      resumenCon([
        envio({ actividadId: "1", estado: "RECOLECTANDO" }),
        envio({ actividadId: "2", estado: "LISTO" }),
        envio({ actividadId: "3", estado: "LISTA" }),
        envio({ actividadId: "4", estado: "EN_TRANSITO" }),
        envio({ actividadId: "5", estado: "EN_CURSO" }),
        envio({ actividadId: "6", estado: "ENTREGADO" }),
        envio({ actividadId: "7", estado: "REALIZADA" }),
      ]),
    );
    expect(panel.fases).toEqual([
      { fase: "RECOLECTANDO", valor: 1 },
      { fase: "PREPARADO", valor: 2 },
      { fase: "EN_MARCHA", valor: 2 },
      { fase: "CUMPLIDO", valor: 2 },
    ]);
    expect(panel.kpis.cumplidas).toBe(2);
  });

  it("agrupa sectores, promedia avance y ordena por demanda (top 6)", () => {
    const panel = derivarPanel(
      resumenCon([
        envio({ actividadId: "1", sectorDestino: "Vargas", porcentaje: 40 }),
        envio({ actividadId: "2", sectorDestino: "Vargas", porcentaje: 60 }),
        envio({ actividadId: "3", sectorDestino: "Caracas", porcentaje: 100 }),
      ]),
    );
    expect(panel.sectores[0]).toEqual({
      sector: "Vargas",
      conteo: 2,
      avancePromedio: 50,
    });
    expect(panel.sectores[1]).toEqual({
      sector: "Caracas",
      conteo: 1,
      avancePromedio: 100,
    });
    expect(panel.kpis.sectoresAlcanzados).toBe(2);
    expect(panel.kpis.avancePromedio).toBe(67);
  });

  it("construye una serie mensual continua rellenando huecos con cero", () => {
    const panel = derivarPanel(
      resumenCon([
        envio({ actividadId: "1", fecha: new Date("2026-05-10") }),
        envio({ actividadId: "2", fecha: new Date("2026-05-20") }),
        envio({ actividadId: "3", fecha: new Date("2026-07-03") }),
      ]),
    );
    expect(panel.serieMensual.map((p) => p.valor)).toEqual([2, 0, 1]);
    expect(panel.serieMensual).toHaveLength(3);
    expect(panel.serieMensual[0]?.clave).toBe("2026-05");
    expect(panel.serieMensual[2]?.clave).toBe("2026-07");
  });

  it("acota porcentajes fuera de rango al promediar", () => {
    const panel = derivarPanel(
      resumenCon([
        envio({ actividadId: "1", porcentaje: 150 }),
        envio({ actividadId: "2", porcentaje: -20 }),
      ]),
    );
    expect(panel.kpis.avancePromedio).toBe(50);
  });
});
