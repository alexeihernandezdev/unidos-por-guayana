import type { ArchivoEvidenciaAuditoria } from "@/modules/auditoria/domain";
import {
  confirmarEvidenciaAction,
  prepararSubidaEvidenciaAction,
} from "@/app/(app)/auditoria/solicitudes/actions";

// Subida directa de una evidencia al almacenamiento en 3 pasos (feature 032): pide una
// URL firmada al servidor, hace PUT del binario a Supabase (nunca pasa por la app) y
// confirma los metadatos.

export type ResultadoSubidaEvidencia =
  | { ok: true; evidencia: ArchivoEvidenciaAuditoria }
  | { ok: false; error: string };

export async function subirEvidenciaDirecto(
  solicitudId: string,
  file: File,
): Promise<ResultadoSubidaEvidencia> {
  const prep = await prepararSubidaEvidenciaAction({
    solicitudId,
    contentType: file.type,
    tamanoBytes: file.size,
  });
  if (!prep.ok) return { ok: false, error: prep.error };

  const subida = await fetch(prep.url, {
    method: "PUT",
    headers: { "content-type": file.type, "x-upsert": "true" },
    body: file,
  });
  if (!subida.ok) {
    return { ok: false, error: "No se pudo subir la evidencia. Inténtalo de nuevo." };
  }

  const confirmado = await confirmarEvidenciaAction({
    solicitudId,
    path: prep.path,
    nombreOriginal: file.name,
    contentType: file.type,
    tamanoBytes: file.size,
  });
  if (!confirmado.ok) return { ok: false, error: confirmado.error };

  return { ok: true, evidencia: confirmado.evidencia };
}
