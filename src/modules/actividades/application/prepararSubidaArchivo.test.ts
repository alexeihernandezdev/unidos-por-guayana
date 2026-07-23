import { beforeEach, describe, expect, it } from "vitest";
import { FakeStorage } from "@/modules/archivos/application/fakes";
import { TipoArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import type { ArchivoActividadDeps } from "./deps";
import {
  ActividadNoPerteneceAlAdminError,
  ArchivoInvalidoError,
  LimiteArchivosError,
} from "./errors";
import { InMemoryActividadRepository } from "./fakes";
import { prepararSubidaArchivo } from "./prepararSubidaArchivo";

const DUENO = "admin-1";
const OTRO = "admin-2";

async function crearContexto() {
  const actividades = new InMemoryActividadRepository();
  const storage = new FakeStorage();
  const deps: ArchivoActividadDeps = { actividades, storage };
  const actividad = await actividades.crear({
    adminId: DUENO,
    titulo: "Jornada medica en Petare",
    sectorDestino: "Petare",
    fecha: new Date("2026-07-01T12:00:00Z"),
    horaFin: null,
    tipo: TipoActividad.ENVIO,
    descripcion: null,
    puntosAcopioIds: [],
    metas: [],
  });
  return { actividades, storage, deps, actividad };
}

describe("prepararSubidaArchivo (actividades)", () => {
  let ctx: Awaited<ReturnType<typeof crearContexto>>;

  beforeEach(async () => {
    ctx = await crearContexto();
  });

  it("firma la subida de una imagen principal válida", async () => {
    const { deps, storage, actividad } = ctx;
    const resultado = await prepararSubidaArchivo(
      deps,
      {
        actividadId: actividad.id,
        tipo: TipoArchivoActividad.PRINCIPAL,
        contentType: "image/png",
        tamanoBytes: 2048,
      },
      DUENO,
    );

    expect(resultado.path).toBe(
      `actividades/${actividad.id}/principal/${resultado.path.split("/").pop()}`,
    );
    expect(resultado.url).toContain(resultado.path);
    expect(storage.subidas).toContain(resultado.path);
  });

  it("permite subir en cualquier estado (no solo RECOLECTANDO)", async () => {
    const { deps, actividades, actividad } = ctx;
    // El envío ya se entregó: el dueño aún puede subir fotos del reparto (feature 033).
    await actividades.cambiarEstado(actividad.id, EstadoActividad.ENTREGADO);
    const resultado = await prepararSubidaArchivo(
      deps,
      {
        actividadId: actividad.id,
        tipo: TipoArchivoActividad.ADJUNTO,
        contentType: "application/pdf",
        tamanoBytes: 4096,
      },
      DUENO,
    );
    expect(resultado.path).toContain(`actividades/${actividad.id}/adjuntos/`);
  });

  it("rechaza a quien no es el dueño", async () => {
    const { deps, actividad } = ctx;
    await expect(
      prepararSubidaArchivo(
        deps,
        {
          actividadId: actividad.id,
          tipo: TipoArchivoActividad.PRINCIPAL,
          contentType: "image/png",
          tamanoBytes: 2048,
        },
        OTRO,
      ),
    ).rejects.toBeInstanceOf(ActividadNoPerteneceAlAdminError);
  });

  it("rechaza tipo o tamaño inválidos", async () => {
    const { deps, actividad } = ctx;
    await expect(
      prepararSubidaArchivo(
        deps,
        {
          actividadId: actividad.id,
          tipo: TipoArchivoActividad.PRINCIPAL,
          contentType: "application/pdf",
          tamanoBytes: 2048,
        },
        DUENO,
      ),
    ).rejects.toBeInstanceOf(ArchivoInvalidoError);
  });

  it("rechaza el adjunto número 11", async () => {
    const { deps, actividades, actividad } = ctx;
    for (let i = 0; i < 10; i += 1) {
      await actividades.crearArchivo({
        actividadId: actividad.id,
        tipo: TipoArchivoActividad.ADJUNTO,
        path: `actividades/${actividad.id}/adjuntos/doc-${i}.pdf`,
        nombreOriginal: `doc-${i}.pdf`,
        contentType: "application/pdf",
        tamanoBytes: 1024,
      });
    }
    await expect(
      prepararSubidaArchivo(
        deps,
        {
          actividadId: actividad.id,
          tipo: TipoArchivoActividad.ADJUNTO,
          contentType: "application/pdf",
          tamanoBytes: 1024,
        },
        DUENO,
      ),
    ).rejects.toBeInstanceOf(LimiteArchivosError);
  });
});
