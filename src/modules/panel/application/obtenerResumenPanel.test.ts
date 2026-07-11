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

const ADMIN = "admin-1";
const OTRO_ADMIN = "admin-2";

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

  it("compone el resumen con prioridad y conteos del dueño", async () => {
    const ayuda = await crearAyuda(deps, {
      adminId: ADMIN,
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

    const resumen = await obtenerResumenPanel(deps, ADMIN);

    expect(resumen.enviosPorEstado.RECOLECTANDO).toBe(1);
    expect(resumen.aportesPendientesConteo).toBe(1);
    expect(resumen.solicitudesAbiertasPorUrgencia.ALTA).toBe(1);
    expect(resumen.sectoresTop[0]?.conteo).toBe(2);
    expect(resumen.enviosPrioridad[0]?.ayudaId).toBe(ayuda.id);
    expect(resumen.enviosPrioridad[0]?.solicitudesAfinesConteo).toBe(2);
    expect(resumen.progresoAgregadoRecolectando.metasBajo).toBe(1);
  });

  it("acota envíos y aportes pendientes al adminId (no mezcla dueños)", async () => {
    const propia = await crearAyuda(deps, {
      adminId: ADMIN,
      titulo: "Mía",
      sectorDestino: "Upata",
      fecha: new Date("2026-10-01"),
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 50 }],
    });
    const ajena = await crearAyuda(deps, {
      adminId: OTRO_ADMIN,
      titulo: "Ajena",
      sectorDestino: "Tumeremo",
      fecha: new Date("2026-10-02"),
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 50 }],
    });
    await crearAporte(deps, {
      ayudaId: propia.id,
      recursoId: aguaId,
      colaboradorId: "col-1",
      cantidad: 10,
    });
    await crearAporte(deps, {
      ayudaId: ajena.id,
      recursoId: aguaId,
      colaboradorId: "col-2",
      cantidad: 20,
    });

    const resumen = await obtenerResumenPanel(deps, ADMIN);

    expect(resumen.enviosPorEstado.RECOLECTANDO).toBe(1);
    expect(resumen.aportesPendientesConteo).toBe(1);
    expect(resumen.enviosPrioridad).toHaveLength(1);
    expect(resumen.enviosPrioridad[0]?.ayudaId).toBe(propia.id);
  });
});
