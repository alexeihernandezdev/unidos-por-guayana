import { beforeEach, describe, expect, it } from "vitest";
import { FakeStorage } from "@/modules/archivos/application/fakes";
import { TipoArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import { confirmarArchivo } from "./confirmarArchivo";
import type { ArchivoActividadDeps } from "./deps";
import { ArchivoInvalidoError } from "./errors";
import { InMemoryActividadRepository } from "./fakes";

const DUENO = "admin-1";

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

describe("confirmarArchivo (actividades)", () => {
  let ctx: Awaited<ReturnType<typeof crearContexto>>;

  beforeEach(async () => {
    ctx = await crearContexto();
  });

  it("persiste los metadatos de un adjunto válido", async () => {
    const { deps, actividades, actividad } = ctx;
    const path = `actividades/${actividad.id}/adjuntos/uuid-1.pdf`;
    const archivo = await confirmarArchivo(
      deps,
      {
        actividadId: actividad.id,
        tipo: TipoArchivoActividad.ADJUNTO,
        path,
        nombreOriginal: "acta.pdf",
        contentType: "application/pdf",
        tamanoBytes: 4096,
      },
      DUENO,
    );

    expect(archivo.path).toBe(path);
    expect(await actividades.contarAdjuntos(actividad.id)).toBe(1);
  });

  it("reemplaza la imagen principal previa borrando su objeto", async () => {
    const { deps, actividades, storage, actividad } = ctx;
    const pathVieja = `actividades/${actividad.id}/principal/vieja.png`;
    await confirmarArchivo(
      deps,
      {
        actividadId: actividad.id,
        tipo: TipoArchivoActividad.PRINCIPAL,
        path: pathVieja,
        nombreOriginal: "vieja.png",
        contentType: "image/png",
        tamanoBytes: 2048,
      },
      DUENO,
    );

    const pathNueva = `actividades/${actividad.id}/principal/nueva.png`;
    await confirmarArchivo(
      deps,
      {
        actividadId: actividad.id,
        tipo: TipoArchivoActividad.PRINCIPAL,
        path: pathNueva,
        nombreOriginal: "nueva.png",
        contentType: "image/png",
        tamanoBytes: 3072,
      },
      DUENO,
    );

    expect(storage.eliminados).toContain(pathVieja);
    const principal = await actividades.obtenerArchivoPrincipal(actividad.id);
    expect(principal?.path).toBe(pathNueva);
    const recargada = await actividades.buscarPorId(actividad.id);
    const principales = recargada?.archivos.filter(
      (a) => a.tipo === TipoArchivoActividad.PRINCIPAL,
    );
    expect(principales?.length).toBe(1);
  });

  it("rechaza un path que no pertenece a la actividad", async () => {
    const { deps, actividad } = ctx;
    await expect(
      confirmarArchivo(
        deps,
        {
          actividadId: actividad.id,
          tipo: TipoArchivoActividad.PRINCIPAL,
          path: "actividades/otra-actividad/principal/uuid.png",
          nombreOriginal: "x.png",
          contentType: "image/png",
          tamanoBytes: 2048,
        },
        DUENO,
      ),
    ).rejects.toBeInstanceOf(ArchivoInvalidoError);
  });
});
