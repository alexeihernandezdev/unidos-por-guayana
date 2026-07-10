import { beforeEach, describe, expect, it } from "vitest";
import { crearAporte } from "@/modules/aportes/application/crearAporte";
import { InMemoryAporteRepository } from "@/modules/aportes/application/fakes";
import { crearAyuda } from "@/modules/ayudas/application/crearAyuda";
import { InMemoryAyudaRepository } from "@/modules/ayudas/application/fakes";
import { obtenerResumenPanel } from "./obtenerResumenPanel";
import { crearSolicitud } from "@/modules/solicitudes/application/crearSolicitud";
import { InMemorySolicitudRepository } from "@/modules/solicitudes/application/fakes";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";

describe("obtenerResumenPanel", () => {
  let aguaId: string;
  const ayudas = new InMemoryAyudaRepository();
  const recursos = new InMemoryRecursoRepository();
  const aportes = new InMemoryAporteRepository();
  const solicitudes = new InMemorySolicitudRepository();
  const deps = { ayudas, recursos, aportes, solicitudes };

  beforeEach(async () => {
    ayudas["porId"].clear();
    aportes["porId"].clear();
    solicitudes["porId"].clear();
    const agua = await recursos.crear({
      nombre: "Agua",
      unidad: "L",
      categoria: CategoriaRecurso.SUMINISTRO,
      descripcion: null,
    });
    aguaId = agua.id;
  });

  it("compone el resumen con prioridad y conteos", async () => {
    const ayuda = await crearAyuda(deps, {
      titulo: "Envío principal",
      sectorDestino: "Upata",
      fecha: new Date("2026-10-01"),
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 100 }],
    });
    await crearAporte(deps, {
      ayudaId: ayuda.id,
      recursoId: aguaId,
      colaboradorId: "col-1",
      cantidad: 40,
    });
    await crearSolicitud(deps, {
      sector: "Upata",
      urgencia: UrgenciaSolicitud.ALTA,
      descripcion: "Falta agua",
      solicitanteId: "sol-1",
      recursos: [{ recursoId: aguaId, cantidadEstimada: 10 }],
    });
    await crearSolicitud(deps, {
      sector: " upata ",
      urgencia: UrgenciaSolicitud.MEDIA,
      descripcion: "Otra",
      solicitanteId: "sol-1",
      recursos: [{ recursoId: aguaId, cantidadEstimada: 5 }],
    });

    const resumen = await obtenerResumenPanel(deps);

    expect(resumen.enviosPorEstado.RECOLECTANDO).toBe(1);
    expect(resumen.aportesPendientesConteo).toBe(1);
    expect(resumen.solicitudesAbiertasPorUrgencia.ALTA).toBe(1);
    expect(resumen.sectoresTop[0]?.conteo).toBe(2);
    expect(resumen.enviosPrioridad[0]?.ayudaId).toBe(ayuda.id);
    expect(resumen.enviosPrioridad[0]?.solicitudesAfinesConteo).toBe(2);
    expect(resumen.progresoAgregadoRecolectando.metasBajo).toBe(1);
  });
});
