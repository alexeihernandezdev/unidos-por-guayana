import { beforeEach, describe, expect, it } from "vitest";
import { FakeStorage } from "@/modules/archivos/application/fakes";
import { TipoArchivoSolicitud } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import type { ArchivoSolicitud } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import type { ArchivoSolicitudDeps } from "./deps";
import { eliminarArchivo } from "./eliminarArchivo";
import { ArchivoNoEncontradoError, NoAutorizadoError } from "./errors";
import { InMemorySolicitudRepository } from "./fakes";

const DUENO = "sol-1";
const OTRO = "sol-2";

async function crearContexto() {
  const solicitudes = new InMemorySolicitudRepository();
  const storage = new FakeStorage();
  const deps: ArchivoSolicitudDeps = { solicitudes, storage };
  // Solicitud ABIERTA/PENDIENTE recién creada: los archivos se gestionan desde ya.
  const solicitud = await solicitudes.crear({
    sector: "Petare",
    urgencia: UrgenciaSolicitud.ALTA,
    descripcion: "Necesito ayuda",
    solicitanteId: DUENO,
    recursos: [],
  });
  const archivo: ArchivoSolicitud = await solicitudes.crearArchivo({
    solicitudId: solicitud.id,
    tipo: TipoArchivoSolicitud.ADJUNTO,
    path: `solicitudes/${solicitud.id}/adjuntos/uuid-1.pdf`,
    nombreOriginal: "doc.pdf",
    contentType: "application/pdf",
    tamanoBytes: 1024,
  });
  return { solicitudes, storage, deps, solicitud, archivo };
}

describe("eliminarArchivo", () => {
  let ctx: Awaited<ReturnType<typeof crearContexto>>;

  beforeEach(async () => {
    ctx = await crearContexto();
  });

  it("borra el objeto del almacenamiento y la fila", async () => {
    const { deps, solicitudes, storage, solicitud, archivo } = ctx;
    await eliminarArchivo(deps, archivo.id, DUENO);

    expect(storage.eliminados).toContain(archivo.path);
    expect(await solicitudes.contarAdjuntos(solicitud.id)).toBe(0);
  });

  it("rechaza a quien no es el dueño", async () => {
    const { deps, archivo } = ctx;
    await expect(
      eliminarArchivo(deps, archivo.id, OTRO),
    ).rejects.toBeInstanceOf(NoAutorizadoError);
  });

  it("falla si el archivo no existe", async () => {
    const { deps } = ctx;
    await expect(
      eliminarArchivo(deps, "arch-inexistente", DUENO),
    ).rejects.toBeInstanceOf(ArchivoNoEncontradoError);
  });
});
