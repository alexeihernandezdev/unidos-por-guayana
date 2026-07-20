import { describe, expect, it } from "vitest";
import { InMemoryActividadRepository } from "@/modules/actividades/application/fakes";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import {
  ActividadNoEditableError,
  ActividadNoEncontradaError,
  ActividadNoPerteneceAlAdminError,
} from "@/modules/actividades/application/errors";
import { InMemoryAtencionRepository, type NecesidadSeed } from "./fakes";
import {
  NecesidadNoEncontradaError,
  NecesidadNoPendienteError,
  NecesidadYaAtendidaError,
  RecursoNoSeleccionableError,
} from "./errors";
import { vincularNecesidad, vincularNecesidades } from "./vincularNecesidad";

const ADMIN = "admin-1";

function seed(over: Partial<NecesidadSeed> = {}): NecesidadSeed {
  return {
    recursoSolicitudId: "rs-1",
    recursoId: "rec-1",
    cantidadEstimada: 50,
    solicitudAbierta: true,
    yaAtendida: false,
    recursoSeleccionable: true,
    recursoNombre: "Arroz",
    solicitudId: "sol-1",
    sector: "Upata",
    urgencia: "ALTA",
    solicitanteNombre: "Ana",
    recursoUnidad: "kg",
    recursoCategoria: "SUMINISTRO",
    ...over,
  };
}

async function crearActividadDe(
  actividades: InMemoryActividadRepository,
  adminId = ADMIN,
) {
  return actividades.crear({
    adminId,
    titulo: "Envío a Upata",
    sectorDestino: "Upata",
    fecha: new Date("2026-08-01T00:00:00Z"),
    horaFin: null,
    tipo: TipoActividad.ENVIO,
    descripcion: null,
    puntosAcopioIds: [],
    metas: [],
  });
}

describe("vincularNecesidad", () => {
  it("vincula y usa la cantidad estimada como objetivo de la meta", async () => {
    const actividades = new InMemoryActividadRepository();
    const atenciones = new InMemoryAtencionRepository([seed()]);
    const actividad = await crearActividadDe(actividades);

    await vincularNecesidad(
      { atenciones, actividades },
      actividad.id,
      ADMIN,
      "rs-1",
    );

    expect(atenciones.vinculos).toHaveLength(1);
    expect(atenciones.vinculos[0]).toMatchObject({
      recursoSolicitudId: "rs-1",
      actividadId: actividad.id,
      recursoId: "rec-1",
      cantidadObjetivo: 50,
    });
  });

  it("usa objetivo 1 cuando la necesidad no trae cantidad estimada", async () => {
    const actividades = new InMemoryActividadRepository();
    const atenciones = new InMemoryAtencionRepository([
      seed({ cantidadEstimada: null }),
    ]);
    const actividad = await crearActividadDe(actividades);

    await vincularNecesidad(
      { atenciones, actividades },
      actividad.id,
      ADMIN,
      "rs-1",
    );

    expect(atenciones.vinculos[0]?.cantidadObjetivo).toBe(1);
  });

  it("rechaza una necesidad inexistente", async () => {
    const actividades = new InMemoryActividadRepository();
    const atenciones = new InMemoryAtencionRepository([]);
    const actividad = await crearActividadDe(actividades);

    await expect(
      vincularNecesidad({ atenciones, actividades }, actividad.id, ADMIN, "x"),
    ).rejects.toBeInstanceOf(NecesidadNoEncontradaError);
  });

  it("rechaza una necesidad cuya solicitud no está abierta", async () => {
    const actividades = new InMemoryActividadRepository();
    const atenciones = new InMemoryAtencionRepository([
      seed({ solicitudAbierta: false }),
    ]);
    const actividad = await crearActividadDe(actividades);

    await expect(
      vincularNecesidad({ atenciones, actividades }, actividad.id, ADMIN, "rs-1"),
    ).rejects.toBeInstanceOf(NecesidadNoPendienteError);
  });

  it("rechaza una necesidad ya atendida", async () => {
    const actividades = new InMemoryActividadRepository();
    const atenciones = new InMemoryAtencionRepository([
      seed({ yaAtendida: true }),
    ]);
    const actividad = await crearActividadDe(actividades);

    await expect(
      vincularNecesidad({ atenciones, actividades }, actividad.id, ADMIN, "rs-1"),
    ).rejects.toBeInstanceOf(NecesidadYaAtendidaError);
  });

  it("rechaza un recurso no seleccionable", async () => {
    const actividades = new InMemoryActividadRepository();
    const atenciones = new InMemoryAtencionRepository([
      seed({ recursoSeleccionable: false }),
    ]);
    const actividad = await crearActividadDe(actividades);

    await expect(
      vincularNecesidad({ atenciones, actividades }, actividad.id, ADMIN, "rs-1"),
    ).rejects.toBeInstanceOf(RecursoNoSeleccionableError);
  });

  it("rechaza una actividad de otro administrador", async () => {
    const actividades = new InMemoryActividadRepository();
    const atenciones = new InMemoryAtencionRepository([seed()]);
    const actividad = await crearActividadDe(actividades, "otro-admin");

    await expect(
      vincularNecesidad({ atenciones, actividades }, actividad.id, ADMIN, "rs-1"),
    ).rejects.toBeInstanceOf(ActividadNoPerteneceAlAdminError);
  });

  it("rechaza una actividad que ya no está en RECOLECTANDO", async () => {
    const actividades = new InMemoryActividadRepository();
    const atenciones = new InMemoryAtencionRepository([seed()]);
    const actividad = await crearActividadDe(actividades);
    await actividades.cambiarEstado(actividad.id, EstadoActividad.LISTO);

    await expect(
      vincularNecesidad({ atenciones, actividades }, actividad.id, ADMIN, "rs-1"),
    ).rejects.toBeInstanceOf(ActividadNoEditableError);
  });

  it("rechaza una actividad inexistente", async () => {
    const actividades = new InMemoryActividadRepository();
    const atenciones = new InMemoryAtencionRepository([seed()]);

    await expect(
      vincularNecesidad({ atenciones, actividades }, "no-existe", ADMIN, "rs-1"),
    ).rejects.toBeInstanceOf(ActividadNoEncontradaError);
  });
});

describe("vincularNecesidades (lote)", () => {
  it("vincula las válidas y reporta las fallidas sin abortar", async () => {
    const actividades = new InMemoryActividadRepository();
    const atenciones = new InMemoryAtencionRepository([
      seed({ recursoSolicitudId: "rs-1", recursoId: "rec-1" }),
      seed({
        recursoSolicitudId: "rs-2",
        recursoId: "rec-2",
        yaAtendida: true,
      }),
      seed({ recursoSolicitudId: "rs-3", recursoId: "rec-3" }),
    ]);
    const actividad = await crearActividadDe(actividades);

    const fallidas = await vincularNecesidades(
      { atenciones, actividades },
      actividad.id,
      ADMIN,
      ["rs-1", "rs-2", "rs-3"],
    );

    expect(fallidas).toHaveLength(1);
    expect(fallidas[0]?.recursoSolicitudId).toBe("rs-2");
    expect(atenciones.vinculos.map((v) => v.recursoSolicitudId)).toEqual([
      "rs-1",
      "rs-3",
    ]);
  });
});
