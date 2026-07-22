import type { ArchivoSolicitud } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import type { TipoArchivoSolicitud as TipoArchivo } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import {
  confirmarArchivoAction,
  prepararSubidaArchivoAction,
} from "@/app/(app)/solicitudes/actions";

// Subida directa de un archivo al almacenamiento en 3 pasos (feature 031): pide una
// URL firmada al servidor, hace PUT del binario a Supabase (nunca pasa por la app) y
// confirma los metadatos. Compartido por la edición (`ArchivosSolicitud`) y la creación
// (`SelectorArchivosNueva` vía `NuevaSolicitudCliente`).

export type ResultadoSubida =
  | { ok: true; archivo: ArchivoSolicitud }
  | { ok: false; error: string };

export async function subirArchivoDirecto(
  solicitudId: string,
  file: File,
  tipo: TipoArchivo,
): Promise<ResultadoSubida> {
  const prep = await prepararSubidaArchivoAction({
    solicitudId,
    tipo,
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
    return { ok: false, error: "No se pudo subir el archivo. Inténtalo de nuevo." };
  }

  const confirmado = await confirmarArchivoAction({
    solicitudId,
    tipo,
    path: prep.path,
    nombreOriginal: file.name,
    contentType: file.type,
    tamanoBytes: file.size,
  });
  if (!confirmado.ok) return { ok: false, error: confirmado.error };

  return { ok: true, archivo: confirmado.archivo };
}
