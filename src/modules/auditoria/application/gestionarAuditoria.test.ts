import { describe, expect, it } from "vitest";
import type {
  AuditoriaRepository,
  DictamenAuditoria,
  SolicitudAuditable,
} from "@/modules/auditoria/domain";
import {
  EstadoVerificacionSolicitud,
  ResultadoAuditoria,
} from "@/modules/auditoria/domain";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  emitirDictamenAuditoria,
  listarSolicitudesAuditoria,
  tomarSolicitudAuditoria,
} from "./gestionarAuditoria";
import {
  ConflictoAuditoriaError,
  DictamenAuditoriaInvalidoError,
  SoloAuditorError,
} from "./errors";

const ACTOR = { id: "auditor-1", rol: Rol.AUDITOR } as const;

class AuditoriaFake implements AuditoriaRepository {
  disponible = true;
  ultimoDictamen: DictamenAuditoria | null = null;

  async listar(): Promise<SolicitudAuditable[]> {
    return [];
  }
  async buscarPorId(): Promise<SolicitudAuditable | null> {
    return null;
  }
  async tomar(): Promise<boolean> {
    if (!this.disponible) return false;
    this.disponible = false;
    return true;
  }
  async liberar(): Promise<boolean> {
    return true;
  }
  async dictaminar(input: DictamenAuditoria): Promise<boolean> {
    this.ultimoDictamen = input;
    return true;
  }
  async reenviar(): Promise<boolean> {
    return true;
  }
  async liberarAsignaciones(): Promise<number> {
    return 0;
  }
}

describe("auditoría de solicitudes", () => {
  it("reserva de forma exclusiva una solicitud de la cola", async () => {
    const repo = new AuditoriaFake();
    await tomarSolicitudAuditoria(repo, ACTOR, "sol-1");

    await expect(
      tomarSolicitudAuditoria(repo, { ...ACTOR, id: "auditor-2" }, "sol-1"),
    ).rejects.toBeInstanceOf(ConflictoAuditoriaError);
  });

  it("exige explicación pública al pedir información", async () => {
    const repo = new AuditoriaFake();
    await expect(
      emitirDictamenAuditoria(repo, ACTOR, "sol-1", {
        resultado: ResultadoAuditoria.REQUIERE_INFORMACION,
        metodo: "Llamada telefónica",
        notaInterna: "No fue posible confirmar el domicilio.",
      }),
    ).rejects.toBeInstanceOf(DictamenAuditoriaInvalidoError);
  });

  it("normaliza y conserva el respaldo de un dictamen", async () => {
    const repo = new AuditoriaFake();
    await emitirDictamenAuditoria(repo, ACTOR, "sol-1", {
      resultado: ResultadoAuditoria.VERIFICADA,
      metodo: "  Visita externa  ",
      notaInterna: "  Dirección y contacto confirmados.  ",
      referenciaExterna: "  REF-2026-10  ",
    });

    expect(repo.ultimoDictamen).toMatchObject({
      resultado: EstadoVerificacionSolicitud.VERIFICADA,
      metodo: "Visita externa",
      notaInterna: "Dirección y contacto confirmados.",
      referenciaExterna: "REF-2026-10",
    });
  });

  it("impide consultar la cola con otro rol", async () => {
    await expect(
      listarSolicitudesAuditoria(
        new AuditoriaFake(),
        { id: "admin", rol: Rol.ADMIN },
        { urgencia: UrgenciaSolicitud.ALTA },
      ),
    ).rejects.toBeInstanceOf(SoloAuditorError);
  });
});
