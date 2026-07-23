import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { catalogoDePrueba } from "@/modules/ubicacion/application/fakes";
import { crearSolicitud } from "./crearSolicitud";
import type { SolicitudDeps } from "./deps";
import {
  NoAutorizadoError,
  SolicitudNoEditableError,
} from "./errors";
import { editarSolicitud } from "./editarSolicitud";
import { InMemorySolicitudRepository } from "./fakes";
import { EstadoVerificacionSolicitud } from "@/modules/auditoria/domain";

const SOLICITANTE_ID = "sol-user-1";
const OTRO_ID = "sol-user-2";

const { repo: catalogo, guaira, miranda, vargas, baruta } = catalogoDePrueba();
const UBICACION = { estadoId: guaira.id, municipioId: vargas.id } as const;

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
    catalogo,
  };

  const solicitud = await crearSolicitud(
    deps,
    {
      sector: "Petare",
      ...UBICACION,
      urgencia: UrgenciaSolicitud.MEDIA,
      descripcion: "Necesitamos agua",
      recursos: [{ recursoId: agua.id }],
    },
    SOLICITANTE_ID,
  );

  return { deps, agua, solicitud };
}

describe("editarSolicitud", () => {
  let ctx: Awaited<ReturnType<typeof crearDeps>>;

  beforeEach(async () => {
    ctx = await crearDeps();
  });

  it("permite al dueño editar cuando auditoría requiere información", async () => {
    const { deps, solicitud } = ctx;
    (deps.solicitudes as InMemorySolicitudRepository).establecerEstadoVerificacion(
      solicitud.id,
      EstadoVerificacionSolicitud.REQUIERE_INFORMACION,
    );

    const actualizada = await editarSolicitud(
      deps,
      solicitud.id,
      { sector: "Petare Norte", descripcion: "Actualizado" },
      SOLICITANTE_ID,
    );

    expect(actualizada.sector).toBe("Petare Norte");
    expect(actualizada.descripcion).toBe("Actualizado");
  });

  it("permite cambiar la ubicación cuando auditoría requiere información", async () => {
    const { deps, solicitud } = ctx;
    (deps.solicitudes as InMemorySolicitudRepository).establecerEstadoVerificacion(
      solicitud.id,
      EstadoVerificacionSolicitud.REQUIERE_INFORMACION,
    );

    const actualizada = await editarSolicitud(
      deps,
      solicitud.id,
      { estadoId: miranda.id, municipioId: baruta.id },
      SOLICITANTE_ID,
    );

    expect(actualizada.estadoId).toBe(miranda.id);
    expect(actualizada.municipioId).toBe(baruta.id);
  });

  it("bloquea la edición mientras está pendiente de auditoría", async () => {
    const { deps, solicitud } = ctx;

    await expect(
      editarSolicitud(
        deps,
        solicitud.id,
        { sector: "Otro sector" },
        SOLICITANTE_ID,
      ),
    ).rejects.toBeInstanceOf(SolicitudNoEditableError);
  });

  it("rechaza edición por quien no es el dueño", async () => {
    const { deps, solicitud } = ctx;

    await expect(
      editarSolicitud(
        deps,
        solicitud.id,
        { sector: "Otro sector" },
        OTRO_ID,
      ),
    ).rejects.toBeInstanceOf(NoAutorizadoError);
  });

  it("bloquea edición fuera de ABIERTA", async () => {
    const { deps, solicitud } = ctx;

    await deps.solicitudes.cambiarEstado(
      solicitud.id,
      EstadoSolicitud.ATENDIDA,
    );

    await expect(
      editarSolicitud(
        deps,
        solicitud.id,
        { sector: "Otro sector" },
        SOLICITANTE_ID,
      ),
    ).rejects.toBeInstanceOf(SolicitudNoEditableError);
  });
});
