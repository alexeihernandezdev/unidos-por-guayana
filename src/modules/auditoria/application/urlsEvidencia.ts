import type { ArchivoEvidenciaAuditoria } from "@/modules/auditoria/domain";
import type { EvidenciaAuditoriaDeps } from "./evidenciaDeps";

// Vigencia del enlace de lectura firmado (1 hora), igual que los archivos del solicitante.
const EXPIRA_LECTURA_SEGUNDOS = 60 * 60;

export type EvidenciaConUrl = ArchivoEvidenciaAuditoria & { url: string };

/**
 * Lista la evidencia de una solicitud con un enlace de lectura firmado por cada objeto.
 * Lanza si el almacenamiento no está disponible (el consumidor degrada) (feature 032).
 */
export async function urlsEvidenciaDeSolicitud(
  deps: Pick<EvidenciaAuditoriaDeps, "evidencias" | "storage">,
  solicitudId: string,
): Promise<EvidenciaConUrl[]> {
  const evidencias = await deps.evidencias.listarEvidencias(solicitudId);
  return Promise.all(
    evidencias.map(async (evidencia) => ({
      ...evidencia,
      url: await deps.storage.crearUrlLecturaFirmada(
        evidencia.path,
        EXPIRA_LECTURA_SEGUNDOS,
      ),
    })),
  );
}
