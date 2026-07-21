import { TipoArchivoSolicitud } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import type { TipoArchivoSolicitud as TipoArchivo } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import {
  construirPath,
  esAdjuntoValido,
  esImagenPrincipalValida,
  puedeAgregarAdjunto,
} from "@/modules/solicitudes/domain/reglasArchivos";
import {
  cargarSolicitudEditableDelDueno,
  type ArchivoSolicitudDeps,
} from "./deps";
import { ArchivoInvalidoError, LimiteArchivosError } from "./errors";

export type PrepararSubidaInput = {
  solicitudId: string;
  tipo: TipoArchivo;
  contentType: string;
  tamanoBytes: number;
};

export type PreparacionSubida = {
  /** Ruta del objeto en el bucket (se persiste al confirmar). */
  path: string;
  /** URL firmada, absoluta y de un solo uso, a la que el cliente sube el binario. */
  url: string;
};

/**
 * Valida permisos y límites, y devuelve una URL firmada para que el navegador suba el
 * archivo DIRECTO al almacenamiento (nunca pasa por el servidor de la app). El caso de
 * uso no persiste nada todavía: eso ocurre en `confirmarArchivo` tras la subida.
 */
export async function prepararSubidaArchivo(
  deps: ArchivoSolicitudDeps,
  input: PrepararSubidaInput,
  actorId: string,
): Promise<PreparacionSubida> {
  const { solicitudes, storage } = deps;
  await cargarSolicitudEditableDelDueno(solicitudes, input.solicitudId, actorId);

  if (input.tipo === TipoArchivoSolicitud.PRINCIPAL) {
    if (!esImagenPrincipalValida(input.contentType, input.tamanoBytes)) {
      throw new ArchivoInvalidoError(
        "La imagen principal debe ser JPG, PNG o WEBP y pesar 5 MB o menos.",
      );
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

  const uuid = crypto.randomUUID();
  const path = construirPath(
    input.solicitudId,
    input.tipo,
    uuid,
    input.contentType,
  );
  const subida = await storage.crearUrlSubidaFirmada(path, input.contentType);
  return { path: subida.path, url: subida.url };
}
