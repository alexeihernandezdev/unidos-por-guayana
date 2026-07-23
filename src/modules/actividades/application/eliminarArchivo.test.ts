import { beforeEach, describe, expect, it } from "vitest";
import { FakeStorage } from "@/modules/archivos/application/fakes";
import { TipoArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import type { ArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import type { ArchivoActividadDeps } from "./deps";
import { eliminarArchivo } from "./eliminarArchivo";
import {
  ActividadNoPerteneceAlAdminError,
  ArchivoNoEncontradoError,
} from "./errors";
import { InMemoryActividadRepository } from "./fakes";

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
  const archivo: ArchivoActividad = await actividades.crearArchivo({
    actividadId: actividad.id,
    tipo: TipoArchivoActividad.ADJUNTO,
    path: `actividades/${actividad.id}/adjuntos/uuid-1.pdf`,
    nombreOriginal: "doc.pdf",
    contentType: "application/pdf",
    tamanoBytes: 1024,
  });
  return { actividades, storage, deps, actividad, archivo };
}

describe("eliminarArchivo (actividades)", () => {
  let ctx: Awaited<ReturnType<typeof crearContexto>>;

  beforeEach(async () => {
    ctx = await crearContexto();
  });

  it("borra el objeto del almacenamiento y la fila", async () => {
    const { deps, actividades, storage, actividad, archivo } = ctx;
    await eliminarArchivo(deps, archivo.id, DUENO);

    expect(storage.eliminados).toContain(archivo.path);
    expect(await actividades.contarAdjuntos(actividad.id)).toBe(0);
  });

  it("rechaza a quien no es el dueño", async () => {
    const { deps, archivo } = ctx;
    await expect(
      eliminarArchivo(deps, archivo.id, OTRO),
    ).rejects.toBeInstanceOf(ActividadNoPerteneceAlAdminError);
  });

  it("falla si el archivo no existe", async () => {
    const { deps } = ctx;
    await expect(
      eliminarArchivo(deps, "arch-inexistente", DUENO),
    ).rejects.toBeInstanceOf(ArchivoNoEncontradoError);
  });
});
