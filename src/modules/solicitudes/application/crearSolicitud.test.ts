import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { crearSolicitud } from "./crearSolicitud";
import type { SolicitudDeps } from "./deps";
import { DatosSolicitudInvalidosError, RecursoInvalidoError } from "./errors";
import { InMemorySolicitudRepository } from "./fakes";

const SOLICITANTE_ID = "sol-user-1";

async function crearDeps() {
  const recursos = new InMemoryRecursoRepository();
  const agua = await recursos.crear({
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const alimentos = await recursos.crear({
    nombre: "Alimentos",
    unidad: "cajas",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const archivado = await recursos.crear({
    nombre: "Camión viejo",
    unidad: "vehículos",
    categoria: CategoriaRecurso.TRANSPORTE,
    descripcion: null,
  });
  await recursos.actualizar(archivado.id, { activo: false });

  const deps: SolicitudDeps = {
    solicitudes: new InMemorySolicitudRepository(),
    recursos,
  };
  return { deps, agua, alimentos, archivado };
}

describe("crearSolicitud", () => {
  let ctx: Awaited<ReturnType<typeof crearDeps>>;

  beforeEach(async () => {
    ctx = await crearDeps();
  });

  it("crea una solicitud con recursos y nace en ABIERTA", async () => {
    const { deps, agua, alimentos } = ctx;

    const solicitud = await crearSolicitud(
      deps,
      {
        sector: "Petare Sur",
        urgencia: UrgenciaSolicitud.ALTA,
        descripcion: "Necesitamos agua y alimentos urgentemente.",
        recursos: [
          { recursoId: agua.id, cantidadEstimada: 500 },
          { recursoId: alimentos.id },
        ],
      },
      SOLICITANTE_ID,
    );

    expect(solicitud.id).toBeTruthy();
    expect(solicitud.estado).toBe(EstadoSolicitud.ABIERTA);
    expect(solicitud.solicitanteId).toBe(SOLICITANTE_ID);
    expect(solicitud.recursos).toHaveLength(2);
    expect(solicitud.cerradaPor).toBeNull();
  });

  it("normaliza sector y descripción (trim)", async () => {
    const { deps, agua } = ctx;

    const solicitud = await crearSolicitud(
      deps,
      {
        sector: "  Petare Sur  ",
        urgencia: UrgenciaSolicitud.MEDIA,
        descripcion: "  Necesitamos ayuda  ",
        recursos: [{ recursoId: agua.id }],
      },
      SOLICITANTE_ID,
    );

    expect(solicitud.sector).toBe("Petare Sur");
    expect(solicitud.descripcion).toBe("Necesitamos ayuda");
  });

  it("rechaza un sector vacío", async () => {
    const { deps, agua } = ctx;

    await expect(
      crearSolicitud(
        deps,
        {
          sector: "   ",
          urgencia: UrgenciaSolicitud.BAJA,
          descripcion: "Actividad",
          recursos: [{ recursoId: agua.id }],
        },
        SOLICITANTE_ID,
      ),
    ).rejects.toBeInstanceOf(DatosSolicitudInvalidosError);
  });

  it("rechaza una descripción vacía", async () => {
    const { deps, agua } = ctx;

    await expect(
      crearSolicitud(
        deps,
        {
          sector: "Petare",
          urgencia: UrgenciaSolicitud.BAJA,
          descripcion: "  ",
          recursos: [{ recursoId: agua.id }],
        },
        SOLICITANTE_ID,
      ),
    ).rejects.toBeInstanceOf(DatosSolicitudInvalidosError);
  });

  it("exige al menos un recurso", async () => {
    const { deps } = ctx;

    await expect(
      crearSolicitud(
        deps,
        {
          sector: "Petare",
          urgencia: UrgenciaSolicitud.BAJA,
          descripcion: "Actividad",
          recursos: [],
        },
        SOLICITANTE_ID,
      ),
    ).rejects.toBeInstanceOf(DatosSolicitudInvalidosError);
  });

  it("rechaza recursos repetidos", async () => {
    const { deps, agua } = ctx;

    await expect(
      crearSolicitud(
        deps,
        {
          sector: "Petare",
          urgencia: UrgenciaSolicitud.BAJA,
          descripcion: "Actividad",
          recursos: [
            { recursoId: agua.id },
            { recursoId: agua.id },
          ],
        },
        SOLICITANTE_ID,
      ),
    ).rejects.toBeInstanceOf(DatosSolicitudInvalidosError);
  });

  it("rechaza cantidad estimada no positiva", async () => {
    const { deps, agua } = ctx;

    await expect(
      crearSolicitud(
        deps,
        {
          sector: "Petare",
          urgencia: UrgenciaSolicitud.BAJA,
          descripcion: "Actividad",
          recursos: [{ recursoId: agua.id, cantidadEstimada: 0 }],
        },
        SOLICITANTE_ID,
      ),
    ).rejects.toBeInstanceOf(DatosSolicitudInvalidosError);
  });

  it("rechaza recurso inexistente", async () => {
    const { deps } = ctx;

    await expect(
      crearSolicitud(
        deps,
        {
          sector: "Petare",
          urgencia: UrgenciaSolicitud.BAJA,
          descripcion: "Actividad",
          recursos: [{ recursoId: "no-existe" }],
        },
        SOLICITANTE_ID,
      ),
    ).rejects.toBeInstanceOf(RecursoInvalidoError);
  });

  it("rechaza recurso archivado", async () => {
    const { deps, archivado } = ctx;

    await expect(
      crearSolicitud(
        deps,
        {
          sector: "Petare",
          urgencia: UrgenciaSolicitud.BAJA,
          descripcion: "Actividad",
          recursos: [{ recursoId: archivado.id }],
        },
        SOLICITANTE_ID,
      ),
    ).rejects.toBeInstanceOf(RecursoInvalidoError);
  });
});
