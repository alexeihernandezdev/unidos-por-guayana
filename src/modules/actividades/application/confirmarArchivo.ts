import type { ArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import { TipoArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import type { TipoArchivoActividad as TipoArchivo } from "@/modules/actividades/domain/ArchivoActividad";
import {
  esAdjuntoValido,
  esImagenPrincipalValida,
  esPathDeActividad,
  puedeAgregarAdjunto,
} from "@/modules/actividades/domain/reglasArchivos";
import {
  cargarActividadDelDueno,
  type ArchivoActividadDeps,
} from "./deps";
import { ArchivoInvalidoError, LimiteArchivosError } from "./errors";

export type ConfirmarArchivoInput = {
  actividadId: string;
  tipo: TipoArchivo;
  path: string;
  nombreOriginal: string;
  contentType: string;
  tamanoBytes: number;
};

/**
 * Persiste los metadatos de un archivo YA subido al almacenamiento. Revalida permisos,
 * tipo, tamaño y que el `path` pertenezca a esta actividad (defensa ante paths
 * inyectados). Si es la imagen `PRINCIPAL` y ya había una, la reemplaza (borra el objeto
 * anterior y su fila).
 */
export async function confirmarArchivo(
  deps: ArchivoActividadDeps,
  input: ConfirmarArchivoInput,
  actorId: string,
): Promise<ArchivoActividad> {
  const { actividades, storage } = deps;
  await cargarActividadDelDueno(actividades, input.actividadId, actorId);

  if (!esPathDeActividad(input.path, input.actividadId, input.tipo)) {
    throw new ArchivoInvalidoError("La ruta del archivo no es válida.");
  }

  if (input.tipo === TipoArchivoActividad.PRINCIPAL) {
    if (!esImagenPrincipalValida(input.contentType, input.tamanoBytes)) {
      throw new ArchivoInvalidoError(
        "La imagen principal debe ser JPG, PNG o WEBP y pesar 5 MB o menos.",
      );
    }
    const previa = await actividades.obtenerArchivoPrincipal(input.actividadId);
    if (previa) {
      await storage.eliminar([previa.path]);
      await actividades.eliminarArchivo(previa.id);
    }
  } else {
    if (!esAdjuntoValido(input.contentType, input.tamanoBytes)) {
      throw new ArchivoInvalidoError(
        "El adjunto debe ser una imagen, un PDF o un documento Word, y pesar 10 MB o menos.",
      );
    }
    const adjuntos = await actividades.contarAdjuntos(input.actividadId);
    if (!puedeAgregarAdjunto(adjuntos)) {
      throw new LimiteArchivosError(
        "Has alcanzado el máximo de 10 documentos adjuntos.",
      );
    }
  }

  return actividades.crearArchivo({
    actividadId: input.actividadId,
    tipo: input.tipo,
    path: input.path,
    nombreOriginal: input.nombreOriginal,
    contentType: input.contentType,
    tamanoBytes: input.tamanoBytes,
  });
}
