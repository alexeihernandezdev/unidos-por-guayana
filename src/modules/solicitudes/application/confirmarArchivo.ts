import type { ArchivoSolicitud } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import { TipoArchivoSolicitud } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import type { TipoArchivoSolicitud as TipoArchivo } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import {
  esAdjuntoValido,
  esImagenPrincipalValida,
  esPathDeSolicitud,
  puedeAgregarAdjunto,
} from "@/modules/solicitudes/domain/reglasArchivos";
import {
  cargarSolicitudEditableDelDueno,
  type ArchivoSolicitudDeps,
} from "./deps";
import { ArchivoInvalidoError, LimiteArchivosError } from "./errors";

export type ConfirmarArchivoInput = {
  solicitudId: string;
  tipo: TipoArchivo;
  path: string;
  nombreOriginal: string;
  contentType: string;
  tamanoBytes: number;
};

/**
 * Persiste los metadatos de un archivo YA subido al almacenamiento. Revalida permisos,
 * tipo, tamaño y que el `path` pertenezca a esta solicitud (defensa ante paths
 * inyectados). Si es la imagen `PRINCIPAL` y ya había una, la reemplaza (borra el objeto
 * anterior y su fila).
 */
export async function confirmarArchivo(
  deps: ArchivoSolicitudDeps,
  input: ConfirmarArchivoInput,
  actorId: string,
): Promise<ArchivoSolicitud> {
  const { solicitudes, storage } = deps;
  await cargarSolicitudEditableDelDueno(solicitudes, input.solicitudId, actorId);

  if (!esPathDeSolicitud(input.path, input.solicitudId, input.tipo)) {
    throw new ArchivoInvalidoError("La ruta del archivo no es válida.");
  }

  if (input.tipo === TipoArchivoSolicitud.PRINCIPAL) {
    if (!esImagenPrincipalValida(input.contentType, input.tamanoBytes)) {
      throw new ArchivoInvalidoError(
        "La imagen principal debe ser JPG, PNG o WEBP y pesar 5 MB o menos.",
      );
    }
    const previa = await solicitudes.obtenerArchivoPrincipal(input.solicitudId);
    if (previa) {
      await storage.eliminar([previa.path]);
      await solicitudes.eliminarArchivo(previa.id);
    }
  } else {
    if (!esAdjuntoValido(input.contentType, input.tamanoBytes)) {
      throw new ArchivoInvalidoError(
        "El adjunto debe ser una imagen, un PDF o un documento Word, y pesar 10 MB o menos.",
      );
    }
    const adjuntos = await solicitudes.contarAdjuntos(input.solicitudId);
    if (!puedeAgregarAdjunto(adjuntos)) {
      throw new LimiteArchivosError(
        "Has alcanzado el máximo de 10 documentos adjuntos.",
      );
    }
  }

  return solicitudes.crearArchivo({
    solicitudId: input.solicitudId,
    tipo: input.tipo,
    path: input.path,
    nombreOriginal: input.nombreOriginal,
    contentType: input.contentType,
    tamanoBytes: input.tamanoBytes,
  });
}
