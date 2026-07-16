import { beforeEach, describe, expect, it } from "vitest";
import { crearAporte } from "@/modules/aportes/application/crearAporte";
import { InMemoryAporteRepository } from "@/modules/aportes/application/fakes";
import { crearActividad } from "@/modules/actividades/application/crearActividad";
import { InMemoryActividadRepository } from "@/modules/actividades/application/fakes";
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
  const actividades = new InMemoryActividadRepository();
  const recursos = new InMemoryRecursoRepository();
  const aportes = new InMemoryAporteRepository();
  const solicitudes = new InMemorySolicitudRepository();
  const deps = { actividades, recursos, aportes, solicitudes };

  beforeEach(async () => {
    actividades["porId"].clear();
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
    const ayuda = await crearActividad(deps, {
      adminId: ADMIN,
      titulo: "Envío principal",
      sectorDestino: "Upata",
      fecha: new Date("2026-10-01"),
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 100 }],
    });
    await crearAporte(deps, {
      actividadId: ayuda.id,
      recursoId: aguaId,
      colaboradorId: "col-1",
      cantidad: 40,
    });
    await crearSolicitud(deps, {
      sector: "Upata",
      urgencia: UrgenciaSolicitud.ALTA,
      descripcion: "Falta agua",
      recursos: [{ recursoId: aguaId, cantidadEstimada: 10 }],
    }, "sol-1");
    await crearSolicitud(deps, {
      sector: " upata ",
      urgencia: UrgenciaSolicitud.MEDIA,
      descripcion: "Otra",
      recursos: [{ recursoId: aguaId, cantidadEstimada: 5 }],
    }, "sol-1");

    const resumen = await obtenerResumenPanel(deps, ADMIN);

    expect(resumen.enviosPorEstado.RECOLECTANDO).toBe(1);
    expect(resumen.aportesPendientesConteo).toBe(1);
    expect(resumen.solicitudesAbiertasPorUrgencia.ALTA).toBe(1);
    expect(resumen.sectoresTop[0]?.conteo).toBe(2);
    expect(resumen.enviosPrioridad[0]?.actividadId).toBe(ayuda.id);
    expect(resumen.enviosPrioridad[0]?.solicitudesAfinesConteo).toBe(2);
    expect(resumen.progresoAgregadoRecolectando.metasBajo).toBe(1);
  });

  it("acota envíos y aportes pendientes al adminId (no mezcla dueños)", async () => {
    const propia = await crearActividad(deps, {
      adminId: ADMIN,
      titulo: "Mía",
      sectorDestino: "Upata",
      fecha: new Date("2026-10-01"),
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 50 }],
    });
    const ajena = await crearActividad(deps, {
      adminId: OTRO_ADMIN,
      titulo: "Ajena",
      sectorDestino: "Tumeremo",
      fecha: new Date("2026-10-02"),
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 50 }],
    });
    await crearAporte(deps, {
      actividadId: propia.id,
      recursoId: aguaId,
      colaboradorId: "col-1",
      cantidad: 10,
    });
    await crearAporte(deps, {
      actividadId: ajena.id,
      recursoId: aguaId,
      colaboradorId: "col-2",
      cantidad: 20,
    });

    const resumen = await obtenerResumenPanel(deps, ADMIN);

    expect(resumen.enviosPorEstado.RECOLECTANDO).toBe(1);
    expect(resumen.aportesPendientesConteo).toBe(1);
    expect(resumen.enviosPrioridad).toHaveLength(1);
    expect(resumen.enviosPrioridad[0]?.actividadId).toBe(propia.id);
  });

  it("combina centro y rango operativo con límites inclusivos", async () => {
    async function actividad(
      titulo: string,
      fecha: string,
      puntosAcopioIds: string[],
    ) {
      return actividades.crear({
        adminId: ADMIN,
        titulo,
        sectorDestino: "Upata",
        fecha: new Date(fecha + "T00:00:00.000Z"),
        horaFin: null,
        tipo: "ENVIO",
        descripcion: null,
        puntosAcopioIds,
        metas: [{ recursoId: aguaId, cantidadObjetivo: 100 }],
      });
    }

    const inicio = await actividad("Inicio", "2026-06-01", ["centro-1"]);
    const fin = await actividad("Fin", "2026-06-30", ["centro-1"]);
    await actividad("Otro centro", "2026-06-15", ["centro-2"]);
    await actividad("Sin centro", "2026-06-15", []);
    await actividad("Fuera del período", "2026-07-01", ["centro-1"]);

    for (const item of [inicio, fin]) {
      await crearAporte(deps, {
        actividadId: item.id,
        recursoId: aguaId,
        colaboradorId: "col-1",
        cantidad: 10,
      });
    }
    await crearSolicitud(deps, {
      sector: "Upata",
      urgencia: UrgenciaSolicitud.ALTA,
      descripcion: "Solicitud global",
      recursos: [{ recursoId: aguaId, cantidadEstimada: 1 }],
    }, "sol-1");

    const resumen = await obtenerResumenPanel(
      deps,
      ADMIN,
      new Date("2026-06-30T00:00:00.000Z"),
      {
        puntoAcopioId: "centro-1",
        fechaDesde: new Date("2026-06-01T00:00:00.000Z"),
        fechaHasta: new Date("2026-06-30T00:00:00.000Z"),
      },
    );

    expect(resumen.estadisticas.totalActividades).toBe(2);
    expect(resumen.enviosPorEstado.RECOLECTANDO).toBe(2);
    expect(resumen.enviosPrioridad.map((envio) => envio.actividadId)).toEqual([
      inicio.id,
      fin.id,
    ]);
    expect(resumen.aportesPendientesConteo).toBe(2);
    expect(resumen.solicitudesAbiertasPorUrgencia.ALTA).toBe(1);
  });
});
