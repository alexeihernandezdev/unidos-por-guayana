import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { CerradaPor } from "@/modules/solicitudes/domain/CerradaPor";
import { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { cancelarSolicitud } from "./cancelarSolicitud";
import { crearSolicitud } from "./crearSolicitud";
import type { SolicitudDeps } from "./deps";
import {
  NoAutorizadoError,
  TransicionInvalidaError,
} from "./errors";
import { InMemorySolicitudRepository } from "./fakes";

const SOLICITANTE_ID = "sol-user-1";
const OTRO_ID = "sol-user-2";

async function crearDeps() {
  const recursos = new InMemoryRecursoRepository();
  const agua = await recursos.crear({
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });

  const deps: SolicitudDeps = {
    solicitudes: new InMemorySolicitudRepository(),
    recursos,
  };

  const solicitud = await crearSolicitud(
    deps,
    {
      sector: "Petare",
      urgencia: UrgenciaSolicitud.MEDIA,
      descripcion: "Necesitamos agua",
      recursos: [{ recursoId: agua.id }],
    },
    SOLICITANTE_ID,
  );

  return { deps, solicitud };
}

describe("cancelarSolicitud", () => {
  let ctx: Awaited<ReturnType<typeof crearDeps>>;

  beforeEach(async () => {
    ctx = await crearDeps();
  });

  it("permite al dueño cancelar y deja cerradaPor = SOLICITANTE", async () => {
    const { deps, solicitud } = ctx;

    const cancelada = await cancelarSolicitud(
      deps,
      solicitud.id,
      SOLICITANTE_ID,
    );

    expect(cancelada.estado).toBe(EstadoSolicitud.CERRADA);
    expect(cancelada.cerradaPor).toBe(CerradaPor.SOLICITANTE);
  });

  it("rechaza cancelación por quien no es el dueño", async () => {
    const { deps, solicitud } = ctx;

    await expect(
      cancelarSolicitud(deps, solicitud.id, OTRO_ID),
    ).rejects.toBeInstanceOf(NoAutorizadoError);
  });

  it("rechaza cancelar una solicitud que ya no está ABIERTA", async () => {
    const { deps, solicitud } = ctx;

    await deps.solicitudes.cambiarEstado(
      solicitud.id,
      EstadoSolicitud.ATENDIDA,
    );

    await expect(
      cancelarSolicitud(deps, solicitud.id, SOLICITANTE_ID),
    ).rejects.toBeInstanceOf(TransicionInvalidaError);
  });
});
