import { describe, expect, it } from "vitest";
import { InMemoryActividadRepository } from "@/modules/actividades/application/fakes";
import { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import { ActividadNoPerteneceAlAdminError } from "@/modules/actividades/application/errors";
import { InMemoryAtencionRepository } from "./fakes";
import { AtencionNoEncontradaError } from "./errors";
import { desvincularNecesidad } from "./desvincularNecesidad";

const ADMIN = "admin-1";

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

describe("desvincularNecesidad", () => {
  it("borra la atención cuando la actividad es del administrador", async () => {
    const actividades = new InMemoryActividadRepository();
    const atenciones = new InMemoryAtencionRepository([]);
    const actividad = await crearActividadDe(actividades);
    const atencionId = atenciones.sembrarAtencion({
      actividadId: actividad.id,
      recursoSolicitudId: "rs-1",
      recursoId: "rec-1",
    });

    await desvincularNecesidad({ atenciones, actividades }, ADMIN, atencionId);

    expect(await atenciones.buscarAtencion(atencionId)).toBeNull();
  });

  it("rechaza una atención inexistente", async () => {
    const actividades = new InMemoryActividadRepository();
    const atenciones = new InMemoryAtencionRepository([]);

    await expect(
      desvincularNecesidad({ atenciones, actividades }, ADMIN, "no-existe"),
    ).rejects.toBeInstanceOf(AtencionNoEncontradaError);
  });

  it("rechaza desvincular en una actividad de otro administrador", async () => {
    const actividades = new InMemoryActividadRepository();
    const atenciones = new InMemoryAtencionRepository([]);
    const actividad = await crearActividadDe(actividades, "otro-admin");
    const atencionId = atenciones.sembrarAtencion({
      actividadId: actividad.id,
      recursoSolicitudId: "rs-1",
      recursoId: "rec-1",
    });

    await expect(
      desvincularNecesidad({ atenciones, actividades }, ADMIN, atencionId),
    ).rejects.toBeInstanceOf(ActividadNoPerteneceAlAdminError);
  });
});
