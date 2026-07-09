import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { CerradaPor } from "@/modules/solicitudes/domain/CerradaPor";
import { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { cerrarSolicitud } from "./cerrarSolicitud";
import { crearSolicitud } from "./crearSolicitud";
import type { SolicitudDeps } from "./deps";
import { TransicionInvalidaError } from "./errors";
import { InMemorySolicitudRepository } from "./fakes";
import { marcarAtendida } from "./marcarAtendida";

const SOLICITANTE_ID = "sol-user-1";

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

describe("marcarAtendida", () => {
  let ctx: Awaited<ReturnType<typeof crearDeps>>;

  beforeEach(async () => {
    ctx = await crearDeps();
  });

  it("marca una solicitud ABIERTA como ATENDIDA", async () => {
    const { deps, solicitud } = ctx;

    const atendida = await marcarAtendida(deps, solicitud.id);

    expect(atendida.estado).toBe(EstadoSolicitud.ATENDIDA);
    expect(atendida.cerradaPor).toBeNull();
  });

  it("rechaza marcar atendida una solicitud que ya no está ABIERTA", async () => {
    const { deps, solicitud } = ctx;

    await marcarAtendida(deps, solicitud.id);

    await expect(marcarAtendida(deps, solicitud.id)).rejects.toBeInstanceOf(
      TransicionInvalidaError,
    );
  });
});

describe("cerrarSolicitud", () => {
  let ctx: Awaited<ReturnType<typeof crearDeps>>;

  beforeEach(async () => {
    ctx = await crearDeps();
  });

  it("cierra una solicitud ABIERTA con cerradaPor = ADMIN", async () => {
    const { deps, solicitud } = ctx;

    const cerrada = await cerrarSolicitud(deps, solicitud.id);

    expect(cerrada.estado).toBe(EstadoSolicitud.CERRADA);
    expect(cerrada.cerradaPor).toBe(CerradaPor.ADMIN);
  });

  it("rechaza cerrar una solicitud que ya no está ABIERTA", async () => {
    const { deps, solicitud } = ctx;

    await cerrarSolicitud(deps, solicitud.id);

    await expect(cerrarSolicitud(deps, solicitud.id)).rejects.toBeInstanceOf(
      TransicionInvalidaError,
    );
  });
});
