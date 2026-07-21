import type {
  AuditoriaRepository,
  FiltrosAuditoria,
  ResultadoAuditoria,
  SolicitudAuditable,
} from "@/modules/auditoria/domain";
import { EstadoVerificacionSolicitud } from "@/modules/auditoria/domain";
import { Rol, type Rol as RolType } from "@/modules/usuarios/domain/Rol";
import {
  ConflictoAuditoriaError,
  DictamenAuditoriaInvalidoError,
  SolicitudAuditoriaNoEncontradaError,
  SoloAuditorError,
} from "./errors";

export type ActorAuditoria = { id: string; rol: RolType };

function exigirAuditor(actor: ActorAuditoria): void {
  if (actor.rol !== Rol.AUDITOR) throw new SoloAuditorError();
}

export async function listarSolicitudesAuditoria(
  auditorias: AuditoriaRepository,
  actor: ActorAuditoria,
  filtros?: FiltrosAuditoria,
): Promise<SolicitudAuditable[]> {
  exigirAuditor(actor);
  return auditorias.listar(filtros);
}

export async function obtenerSolicitudAuditoria(
  auditorias: AuditoriaRepository,
  actor: ActorAuditoria,
  solicitudId: string,
): Promise<SolicitudAuditable> {
  exigirAuditor(actor);
  const solicitud = await auditorias.buscarPorId(solicitudId);
  if (!solicitud) throw new SolicitudAuditoriaNoEncontradaError();
  return solicitud;
}

export async function tomarSolicitudAuditoria(
  auditorias: AuditoriaRepository,
  actor: ActorAuditoria,
  solicitudId: string,
): Promise<void> {
  exigirAuditor(actor);
  if (!(await auditorias.tomar(solicitudId, actor.id))) {
    throw new ConflictoAuditoriaError(
      "Otra persona tomó la solicitud o ya no está pendiente.",
    );
  }
}

export async function liberarSolicitudAuditoria(
  auditorias: AuditoriaRepository,
  actor: ActorAuditoria,
  solicitudId: string,
): Promise<void> {
  exigirAuditor(actor);
  if (!(await auditorias.liberar(solicitudId, actor.id))) {
    throw new ConflictoAuditoriaError(
      "Solo puedes liberar una solicitud que esté en tu revisión.",
    );
  }
}

export type EmitirDictamenInput = {
  resultado: ResultadoAuditoria;
  metodo: string;
  notaInterna: string;
  explicacionPublica?: string | null;
  referenciaExterna?: string | null;
};

function limpiarOpcional(valor?: string | null): string | null {
  const limpio = valor?.trim() ?? "";
  return limpio || null;
}

export async function emitirDictamenAuditoria(
  auditorias: AuditoriaRepository,
  actor: ActorAuditoria,
  solicitudId: string,
  input: EmitirDictamenInput,
): Promise<void> {
  exigirAuditor(actor);
  const metodo = input.metodo.trim();
  const notaInterna = input.notaInterna.trim();
  const explicacionPublica = limpiarOpcional(input.explicacionPublica);
  const referenciaExterna = limpiarOpcional(input.referenciaExterna);

  if (metodo.length < 3 || metodo.length > 120) {
    throw new DictamenAuditoriaInvalidoError(
      "Describe el método de verificación en 3 a 120 caracteres.",
    );
  }
  if (notaInterna.length < 10 || notaInterna.length > 1000) {
    throw new DictamenAuditoriaInvalidoError(
      "La nota interna debe tener entre 10 y 1000 caracteres.",
    );
  }
  if (
    input.resultado !== EstadoVerificacionSolicitud.VERIFICADA &&
    (!explicacionPublica || explicacionPublica.length < 10)
  ) {
    throw new DictamenAuditoriaInvalidoError(
      "Explica al solicitante qué ocurrió y cómo puede continuar.",
    );
  }
  if ((explicacionPublica?.length ?? 0) > 500) {
    throw new DictamenAuditoriaInvalidoError(
      "La explicación pública no puede superar 500 caracteres.",
    );
  }
  if ((referenciaExterna?.length ?? 0) > 200) {
    throw new DictamenAuditoriaInvalidoError(
      "La referencia externa no puede superar 200 caracteres.",
    );
  }

  const guardado = await auditorias.dictaminar({
    solicitudId,
    auditorId: actor.id,
    resultado: input.resultado,
    metodo,
    notaInterna,
    explicacionPublica,
    referenciaExterna,
  });
  if (!guardado) {
    throw new ConflictoAuditoriaError(
      "Solo quien tomó la solicitud puede emitir el dictamen.",
    );
  }
}

export async function reenviarSolicitudAuditoria(
  auditorias: AuditoriaRepository,
  solicitudId: string,
  solicitanteId: string,
): Promise<void> {
  if (!(await auditorias.reenviar(solicitudId, solicitanteId))) {
    throw new ConflictoAuditoriaError(
      "La solicitud no está esperando información o no te pertenece.",
    );
  }
}
