import { TipoArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import type { TipoArchivoActividad as TipoArchivo } from "@/modules/actividades/domain/ArchivoActividad";
import {
  construirPath,
  esAdjuntoValido,
  esImagenPrincipalValida,
  puedeAgregarAdjunto,
} from "@/modules/actividades/domain/reglasArchivos";
import {
  cargarActividadDelDueno,
  type ArchivoActividadDeps,
} from "./deps";
import { ArchivoInvalidoError, LimiteArchivosError } from "./errors";

export type PrepararSubidaInput = {
  actividadId: string;
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
 * uso no persiste nada todavía: eso ocurre en `confirmarArchivo` tras la subida. El gate
 * es solo la propiedad (dueño), en cualquier estado de la actividad (feature 033).
 */
export async function prepararSubidaArchivo(
  deps: ArchivoActividadDeps,
  input: PrepararSubidaInput,
  actorId: string,
): Promise<PreparacionSubida> {
  const { actividades, storage } = deps;
  await cargarActividadDelDueno(actividades, input.actividadId, actorId);

  if (input.tipo === TipoArchivoActividad.PRINCIPAL) {
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
    const adjuntos = await actividades.contarAdjuntos(input.actividadId);
    if (!puedeAgregarAdjunto(adjuntos)) {
      throw new LimiteArchivosError(
        "Has alcanzado el máximo de 10 documentos adjuntos.",
      );
    }
  }

  const uuid = crypto.randomUUID();
  const path = construirPath(
    input.actividadId,
    input.tipo,
    uuid,
    input.contentType,
  );
  const subida = await storage.crearUrlSubidaFirmada(path, input.contentType);
  return { path: subida.path, url: subida.url };
}
