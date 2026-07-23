import type { ArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import type { TipoArchivoActividad as TipoArchivo } from "@/modules/actividades/domain/ArchivoActividad";
import {
  confirmarArchivoAction,
  prepararSubidaArchivoAction,
} from "@/app/(admin)/panel/actividades/actions";

// Subida directa de un archivo de actividad al almacenamiento en 3 pasos (feature 033):
// pide una URL firmada al servidor, hace PUT del binario a Supabase (nunca pasa por la
// app) y confirma los metadatos. Compartido por la gestión en el detalle
// (`ArchivosActividad`) y la creación (`SelectorArchivosNueva` vía `NuevaActividadCliente`).

export type ResultadoSubida =
  | { ok: true; archivo: ArchivoActividad }
  | { ok: false; error: string };

export async function subirArchivoDirecto(
  actividadId: string,
  file: File,
  tipo: TipoArchivo,
): Promise<ResultadoSubida> {
  const prep = await prepararSubidaArchivoAction({
    actividadId,
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
    actividadId,
    tipo,
    path: prep.path,
    nombreOriginal: file.name,
    contentType: file.type,
    tamanoBytes: file.size,
  });
  if (!confirmado.ok) return { ok: false, error: confirmado.error };

  return { ok: true, archivo: confirmado.archivo };
}
