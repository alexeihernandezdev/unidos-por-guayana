import { beforeEach, describe, expect, it } from "vitest";
import { FakeStorage } from "@/modules/archivos/application/fakes";
import type {
  ArchivoEvidenciaAuditoria,
  AuditoriaRepository,
  EvidenciaAuditoriaRepository,
  NuevaEvidenciaAuditoria,
  SolicitudAuditable,
} from "@/modules/auditoria/domain";
import { EstadoVerificacionSolicitud } from "@/modules/auditoria/domain";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { Rol } from "@/modules/usuarios/domain/Rol";
import type { EvidenciaAuditoriaDeps } from "./evidenciaDeps";
import { prepararSubidaEvidencia } from "./prepararSubidaEvidencia";
import { confirmarEvidencia } from "./confirmarEvidencia";
import { eliminarEvidencia } from "./eliminarEvidencia";
import {
  ConflictoAuditoriaError,
  EvidenciaInvalidaError,
  EvidenciaNoEncontradaError,
  LimiteEvidenciasError,
  SoloAuditorError,
} from "./errors";

const AUDITOR = { id: "auditor-1", rol: Rol.AUDITOR } as const;
const OTRO_AUDITOR = { id: "auditor-2", rol: Rol.AUDITOR } as const;

function solicitud(
  overrides?: Partial<SolicitudAuditable>,
): SolicitudAuditable {
  return {
    id: "sol-1",
    sector: "Petare",
    descripcion: "Necesito ayuda",
    urgencia: UrgenciaSolicitud.ALTA,
    estadoVerificacion: EstadoVerificacionSolicitud.EN_REVISION,
    auditorActualId: AUDITOR.id,
    auditorActualNombre: "Auditor Uno",
    cicloAuditoria: 3,
    solicitante: {
      id: "sol-user",
      nombre: "Ana",
      email: "ana@example.com",
      telefono: null,
    },
    recursos: [],
    eventos: [],
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...overrides,
  };
}

function auditoriasFake(
  s: SolicitudAuditable | null,
): Pick<AuditoriaRepository, "buscarPorId"> {
  return {
    async buscarPorId(id) {
      return s && s.id === id ? s : null;
    },
  };
}

class EvidenciasFake implements EvidenciaAuditoriaRepository {
  items: ArchivoEvidenciaAuditoria[] = [];
  private seq = 0;

  async crearEvidencia(
    input: NuevaEvidenciaAuditoria,
  ): Promise<ArchivoEvidenciaAuditoria> {
    const evidencia: ArchivoEvidenciaAuditoria = {
      ...input,
      id: `ev-${(this.seq += 1)}`,
      subidoPorNombre: null,
      createdAt: new Date(0),
    };
    this.items.push(evidencia);
    return evidencia;
  }
  async listarEvidencias(solicitudId: string) {
    return this.items.filter((e) => e.solicitudId === solicitudId);
  }
  async buscarEvidenciaPorId(id: string) {
    return this.items.find((e) => e.id === id) ?? null;
  }
  async eliminarEvidencia(id: string) {
    this.items = this.items.filter((e) => e.id !== id);
  }
  async contarEvidencias(solicitudId: string) {
    return this.items.filter((e) => e.solicitudId === solicitudId).length;
  }
}

function crearDeps(
  s: SolicitudAuditable | null,
): EvidenciaAuditoriaDeps & { evidencias: EvidenciasFake; storage: FakeStorage } {
  const evidencias = new EvidenciasFake();
  const storage = new FakeStorage();
  return { auditorias: auditoriasFake(s), evidencias, storage };
}

describe("evidencia de auditoría", () => {
  describe("prepararSubidaEvidencia", () => {
    let deps: ReturnType<typeof crearDeps>;
    beforeEach(() => {
      deps = crearDeps(solicitud());
    });

    it("firma la subida de un video para el auditor que la tiene en revisión", async () => {
      const r = await prepararSubidaEvidencia(
        deps,
        { solicitudId: "sol-1", contentType: "video/mp4", tamanoBytes: 8_000_000 },
        AUDITOR,
      );
      expect(r.path).toContain("auditoria/sol-1/evidencia/");
      expect(r.url).toContain(r.path);
      expect(deps.storage.subidas).toContain(r.path);
    });

    it("rechaza a un actor que no es auditor", async () => {
      await expect(
        prepararSubidaEvidencia(
          deps,
          { solicitudId: "sol-1", contentType: "image/png", tamanoBytes: 1024 },
          { id: "x", rol: Rol.ADMIN },
        ),
      ).rejects.toBeInstanceOf(SoloAuditorError);
    });

    it("rechaza si la solicitud no está en revisión propia", async () => {
      const pendiente = crearDeps(
        solicitud({
          estadoVerificacion: EstadoVerificacionSolicitud.PENDIENTE,
          auditorActualId: null,
        }),
      );
      await expect(
        prepararSubidaEvidencia(
          pendiente,
          { solicitudId: "sol-1", contentType: "image/png", tamanoBytes: 1024 },
          AUDITOR,
        ),
      ).rejects.toBeInstanceOf(ConflictoAuditoriaError);
    });

    it("rechaza a otro auditor distinto del que la tomó", async () => {
      await expect(
        prepararSubidaEvidencia(
          deps,
          { solicitudId: "sol-1", contentType: "image/png", tamanoBytes: 1024 },
          OTRO_AUDITOR,
        ),
      ).rejects.toBeInstanceOf(ConflictoAuditoriaError);
    });

    it("rechaza un tipo no permitido", async () => {
      await expect(
        prepararSubidaEvidencia(
          deps,
          { solicitudId: "sol-1", contentType: "text/plain", tamanoBytes: 10 },
          AUDITOR,
        ),
      ).rejects.toBeInstanceOf(EvidenciaInvalidaError);
    });

    it("rechaza la evidencia número 16", async () => {
      for (let i = 0; i < 15; i += 1) {
        await deps.evidencias.crearEvidencia({
          solicitudId: "sol-1",
          subidoPorId: AUDITOR.id,
          ciclo: 3,
          path: `auditoria/sol-1/evidencia/e-${i}.mp4`,
          nombreOriginal: `e-${i}.mp4`,
          contentType: "video/mp4",
          tamanoBytes: 1024,
        });
      }
      await expect(
        prepararSubidaEvidencia(
          deps,
          { solicitudId: "sol-1", contentType: "video/mp4", tamanoBytes: 1024 },
          AUDITOR,
        ),
      ).rejects.toBeInstanceOf(LimiteEvidenciasError);
    });
  });

  describe("confirmarEvidencia", () => {
    it("persiste los metadatos con el ciclo de auditoría vigente", async () => {
      const deps = crearDeps(solicitud({ cicloAuditoria: 3 }));
      const evidencia = await confirmarEvidencia(
        deps,
        {
          solicitudId: "sol-1",
          path: "auditoria/sol-1/evidencia/uuid.mp4",
          nombreOriginal: "prueba.mp4",
          contentType: "video/mp4",
          tamanoBytes: 5_000_000,
        },
        AUDITOR,
      );
      expect(evidencia.ciclo).toBe(3);
      expect(evidencia.subidoPorId).toBe(AUDITOR.id);
      expect(deps.evidencias.items).toHaveLength(1);
    });

    it("rechaza un path que no pertenece a la solicitud", async () => {
      const deps = crearDeps(solicitud());
      await expect(
        confirmarEvidencia(
          deps,
          {
            solicitudId: "sol-1",
            path: "auditoria/otra-sol/evidencia/uuid.mp4",
            nombreOriginal: "x.mp4",
            contentType: "video/mp4",
            tamanoBytes: 1024,
          },
          AUDITOR,
        ),
      ).rejects.toBeInstanceOf(EvidenciaInvalidaError);
    });
  });

  describe("eliminarEvidencia", () => {
    it("borra el objeto y la fila", async () => {
      const deps = crearDeps(solicitud());
      const ev = await deps.evidencias.crearEvidencia({
        solicitudId: "sol-1",
        subidoPorId: AUDITOR.id,
        ciclo: 3,
        path: "auditoria/sol-1/evidencia/uuid.mp4",
        nombreOriginal: "x.mp4",
        contentType: "video/mp4",
        tamanoBytes: 1024,
      });
      await eliminarEvidencia(deps, ev.id, "sol-1", AUDITOR);
      expect(deps.evidencias.items).toHaveLength(0);
      expect(deps.storage.eliminados).toContain(ev.path);
    });

    it("rechaza evidencia de otra solicitud", async () => {
      const deps = crearDeps(solicitud());
      const ev = await deps.evidencias.crearEvidencia({
        solicitudId: "otra-sol",
        subidoPorId: AUDITOR.id,
        ciclo: 1,
        path: "auditoria/otra-sol/evidencia/uuid.mp4",
        nombreOriginal: "x.mp4",
        contentType: "video/mp4",
        tamanoBytes: 1024,
      });
      await expect(
        eliminarEvidencia(deps, ev.id, "sol-1", AUDITOR),
      ).rejects.toBeInstanceOf(EvidenciaNoEncontradaError);
    });
  });
});
