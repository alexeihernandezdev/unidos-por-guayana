import { beforeEach, describe, expect, it } from "vitest";
import { FakeStorage } from "@/modules/archivos/application/fakes";
import { TipoArchivoSolicitud } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import type { ArchivoSolicitudDeps } from "./deps";
import {
  ArchivoInvalidoError,
  LimiteArchivosError,
  NoAutorizadoError,
  SolicitudNoEditableError,
} from "./errors";
import { InMemorySolicitudRepository } from "./fakes";
import { prepararSubidaArchivo } from "./prepararSubidaArchivo";
import { EstadoVerificacionSolicitud } from "@/modules/auditoria/domain";

const DUENO = "sol-1";
const OTRO = "sol-2";

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

describe("prepararSubidaArchivo", () => {
  let ctx: Awaited<ReturnType<typeof crearContexto>>;

  beforeEach(async () => {
    ctx = await crearContexto();
  });

  it("firma la subida de una imagen principal válida", async () => {
    const { deps, storage, solicitud } = ctx;
    const resultado = await prepararSubidaArchivo(
      deps,
      {
        solicitudId: solicitud.id,
        tipo: TipoArchivoSolicitud.PRINCIPAL,
        contentType: "image/png",
        tamanoBytes: 2048,
      },
      DUENO,
    );

    expect(resultado.path).toBe(
      `solicitudes/${solicitud.id}/principal/${resultado.path.split("/").pop()}`,
    );
    expect(resultado.url).toContain(resultado.path);
    expect(storage.subidas).toContain(resultado.path);
  });

  it("rechaza a quien no es el dueño", async () => {
    const { deps, solicitud } = ctx;
    await expect(
      prepararSubidaArchivo(
        deps,
        {
          solicitudId: solicitud.id,
          tipo: TipoArchivoSolicitud.PRINCIPAL,
          contentType: "image/png",
          tamanoBytes: 2048,
        },
        OTRO,
      ),
    ).rejects.toBeInstanceOf(NoAutorizadoError);
  });

  it("rechaza cuando la solicitud ya no está ABIERTA", async () => {
    const { deps, solicitudes, solicitud } = ctx;
    await solicitudes.cambiarEstado(solicitud.id, EstadoSolicitud.ATENDIDA);
    await expect(
      prepararSubidaArchivo(
        deps,
        {
          solicitudId: solicitud.id,
          tipo: TipoArchivoSolicitud.PRINCIPAL,
          contentType: "image/png",
          tamanoBytes: 2048,
        },
        DUENO,
      ),
    ).rejects.toBeInstanceOf(SolicitudNoEditableError);
  });

  it("rechaza tipo o tamaño inválidos", async () => {
    const { deps, solicitud } = ctx;
    await expect(
      prepararSubidaArchivo(
        deps,
        {
          solicitudId: solicitud.id,
          tipo: TipoArchivoSolicitud.PRINCIPAL,
          contentType: "application/pdf",
          tamanoBytes: 2048,
        },
        DUENO,
      ),
    ).rejects.toBeInstanceOf(ArchivoInvalidoError);
  });

  it("rechaza el adjunto número 11", async () => {
    const { deps, solicitudes, solicitud } = ctx;
    for (let i = 0; i < 10; i += 1) {
      await solicitudes.crearArchivo({
        solicitudId: solicitud.id,
        tipo: TipoArchivoSolicitud.ADJUNTO,
        path: `solicitudes/${solicitud.id}/adjuntos/doc-${i}.pdf`,
        nombreOriginal: `doc-${i}.pdf`,
        contentType: "application/pdf",
        tamanoBytes: 1024,
      });
    }
    await expect(
      prepararSubidaArchivo(
        deps,
        {
          solicitudId: solicitud.id,
          tipo: TipoArchivoSolicitud.ADJUNTO,
          contentType: "application/pdf",
          tamanoBytes: 1024,
        },
        DUENO,
      ),
    ).rejects.toBeInstanceOf(LimiteArchivosError);
  });
});
