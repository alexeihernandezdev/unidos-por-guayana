import {
  construirPathEvidencia,
  esEvidenciaValida,
  puedeAgregarEvidencia,
} from "@/modules/auditoria/domain";
import type { ActorAuditoria } from "./gestionarAuditoria";
import {
  cargarSolicitudEnRevisionDelAuditor,
  exigirAuditor,
  type EvidenciaAuditoriaDeps,
} from "./evidenciaDeps";
import { EvidenciaInvalidaError, LimiteEvidenciasError } from "./errors";

export type PrepararSubidaEvidenciaInput = {
  solicitudId: string;
  contentType: string;
  tamanoBytes: number;
};

export type PreparacionSubidaEvidencia = {
  /** Ruta del objeto en el bucket (se persiste al confirmar). */
  path: string;
  /** URL firmada, absoluta y de un solo uso, a la que el navegador sube el binario. */
  url: string;
};

/**
 * Valida permisos y límites y devuelve una URL firmada para que el navegador suba la
 * evidencia DIRECTO al almacenamiento (nunca pasa por el servidor). No persiste nada:
 * eso ocurre en `confirmarEvidencia` tras la subida (feature 032).
 */
export async function prepararSubidaEvidencia(
  deps: EvidenciaAuditoriaDeps,
  input: PrepararSubidaEvidenciaInput,
  actor: ActorAuditoria,
): Promise<PreparacionSubidaEvidencia> {
  exigirAuditor(actor);
  await cargarSolicitudEnRevisionDelAuditor(
    deps.auditorias,
    input.solicitudId,
    actor.id,
  );

  if (!esEvidenciaValida(input.contentType, input.tamanoBytes)) {
    throw new EvidenciaInvalidaError(
      "La evidencia debe ser imagen, video o PDF, y pesar 50 MB o menos.",
    );
  }

  const cantidad = await deps.evidencias.contarEvidencias(input.solicitudId);
  if (!puedeAgregarEvidencia(cantidad)) {
    throw new LimiteEvidenciasError(
      "Has alcanzado el máximo de 15 evidencias.",
    );
  }

  const uuid = crypto.randomUUID();
  const path = construirPathEvidencia(input.solicitudId, uuid, input.contentType);
  const subida = await deps.storage.crearUrlSubidaFirmada(
    path,
    input.contentType,
  );
  return { path: subida.path, url: subida.url };
}
