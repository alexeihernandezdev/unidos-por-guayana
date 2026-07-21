import { beforeEach, describe, expect, it } from "vitest";
import { FakeStorage } from "@/modules/archivos/application/fakes";
import { TipoArchivoSolicitud } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { confirmarArchivo } from "./confirmarArchivo";
import type { ArchivoSolicitudDeps } from "./deps";
import { ArchivoInvalidoError } from "./errors";
import { InMemorySolicitudRepository } from "./fakes";
import { EstadoVerificacionSolicitud } from "@/modules/auditoria/domain";

const DUENO = "sol-1";

async function crearContexto() {
  const solicitudes = new InMemorySolicitudRepository();
  const storage = new FakeStorage();
  const deps: ArchivoSolicitudDeps = { solicitudes, storage };
  const solicitud = await solicitudes.crear({
    sector: "Petare",
    urgencia: UrgenciaSolicitud.ALTA,
    descripcion: "Necesito ayuda",
    solicitanteId: DUENO,
    recursos: [],
  });
  solicitudes.establecerEstadoVerificacion(
    solicitud.id,
    EstadoVerificacionSolicitud.REQUIERE_INFORMACION,
  );
  return { solicitudes, storage, deps, solicitud };
}

describe("confirmarArchivo", () => {
  let ctx: Awaited<ReturnType<typeof crearContexto>>;

  beforeEach(async () => {
    ctx = await crearContexto();
  });

  it("persiste los metadatos de un adjunto válido", async () => {
    const { deps, solicitudes, solicitud } = ctx;
    const path = `solicitudes/${solicitud.id}/adjuntos/uuid-1.pdf`;
    const archivo = await confirmarArchivo(
      deps,
      {
        solicitudId: solicitud.id,
        tipo: TipoArchivoSolicitud.ADJUNTO,
        path,
        nombreOriginal: "presupuesto.pdf",
        contentType: "application/pdf",
        tamanoBytes: 4096,
      },
      DUENO,
    );

    expect(archivo.path).toBe(path);
    expect(await solicitudes.contarAdjuntos(solicitud.id)).toBe(1);
  });

  it("reemplaza la imagen principal previa borrando su objeto", async () => {
    const { deps, solicitudes, storage, solicitud } = ctx;
    const pathVieja = `solicitudes/${solicitud.id}/principal/vieja.png`;
    await confirmarArchivo(
      deps,
      {
        solicitudId: solicitud.id,
        tipo: TipoArchivoSolicitud.PRINCIPAL,
        path: pathVieja,
        nombreOriginal: "vieja.png",
        contentType: "image/png",
        tamanoBytes: 2048,
      },
      DUENO,
    );

    const pathNueva = `solicitudes/${solicitud.id}/principal/nueva.png`;
    await confirmarArchivo(
      deps,
      {
        solicitudId: solicitud.id,
        tipo: TipoArchivoSolicitud.PRINCIPAL,
        path: pathNueva,
        nombreOriginal: "nueva.png",
        contentType: "image/png",
        tamanoBytes: 3072,
      },
      DUENO,
    );

    expect(storage.eliminados).toContain(pathVieja);
    const principal = await solicitudes.obtenerArchivoPrincipal(solicitud.id);
    expect(principal?.path).toBe(pathNueva);
    // Solo debe quedar una fila principal.
    const recargada = await solicitudes.buscarPorId(solicitud.id);
    const principales = recargada?.archivos.filter(
      (a) => a.tipo === TipoArchivoSolicitud.PRINCIPAL,
    );
    expect(principales?.length).toBe(1);
  });

  it("rechaza un path que no pertenece a la solicitud", async () => {
    const { deps, solicitud } = ctx;
    await expect(
      confirmarArchivo(
        deps,
        {
          solicitudId: solicitud.id,
          tipo: TipoArchivoSolicitud.PRINCIPAL,
          path: "solicitudes/otra-solicitud/principal/uuid.png",
          nombreOriginal: "x.png",
          contentType: "image/png",
          tamanoBytes: 2048,
        },
        DUENO,
      ),
    ).rejects.toBeInstanceOf(ArchivoInvalidoError);
  });
});
