import {
  cargarActividadDelDueno,
  type ArchivoActividadDeps,
} from "./deps";
import { ArchivoNoEncontradoError } from "./errors";

/**
 * Borra un archivo de una actividad: valida que el actor sea el dueño, elimina el objeto
 * del almacenamiento y luego la fila de metadatos. No exige estado concreto (feature 033).
 */
export async function eliminarArchivo(
  deps: ArchivoActividadDeps,
  archivoId: string,
  actorId: string,
): Promise<void> {
  const { actividades, storage } = deps;
  const encontrado = await actividades.buscarArchivoPorId(archivoId);
  if (!encontrado) {
    throw new ArchivoNoEncontradoError(archivoId);
  }

  await cargarActividadDelDueno(actividades, encontrado.actividadId, actorId);

  await storage.eliminar([encontrado.archivo.path]);
  await actividades.eliminarArchivo(archivoId);
}
