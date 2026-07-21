import {
  cargarSolicitudEditableDelDueno,
  type ArchivoSolicitudDeps,
} from "./deps";
import { ArchivoNoEncontradoError } from "./errors";

/**
 * Borra un archivo de una solicitud: valida que el actor sea el dueño y que la solicitud
 * siga `ABIERTA`, elimina el objeto del almacenamiento y luego la fila de metadatos.
 */
export async function eliminarArchivo(
  deps: ArchivoSolicitudDeps,
  archivoId: string,
  actorId: string,
): Promise<void> {
  const { solicitudes, storage } = deps;
  const encontrado = await solicitudes.buscarArchivoPorId(archivoId);
  if (!encontrado) {
    throw new ArchivoNoEncontradoError(archivoId);
  }

  await cargarSolicitudEditableDelDueno(
    solicitudes,
    encontrado.solicitudId,
    actorId,
  );

  await storage.eliminar([encontrado.archivo.path]);
  await solicitudes.eliminarArchivo(archivoId);
}
