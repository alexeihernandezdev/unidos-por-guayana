import type { TipoArchivoActividad } from "./ArchivoActividad";
import {
  construirPathArchivo,
  esPathDeArchivo,
} from "@/modules/archivos/domain/reglasArchivos";

// Reglas de dominio puras de los archivos de una actividad (feature 033). Reusa las
// constantes/validadores compartidos del módulo `archivos` (tipos, tamaños, cupo) y solo
// fija aquí la convención de rutas propia de las actividades.

// Prefijo de las rutas de objetos de actividad en el bucket público.
const PREFIJO = "actividades";

// Re-exporta los validadores/constantes compartidos para que el resto del módulo
// (aplicación y UI de actividades) importe todo desde un único punto.
export {
  MB,
  MAX_ADJUNTOS,
  MAX_BYTES_PRINCIPAL,
  MAX_BYTES_ADJUNTO,
  TIPOS_IMAGEN,
  TIPOS_DOCUMENTO,
  TIPOS_ADJUNTO,
  extensionDe,
  esImagenPrincipalValida,
  esAdjuntoValido,
  puedeAgregarAdjunto,
} from "@/modules/archivos/domain/reglasArchivos";

export function construirPath(
  actividadId: string,
  tipo: TipoArchivoActividad,
  uuid: string,
  contentType: string,
): string {
  return construirPathArchivo(PREFIJO, actividadId, tipo, uuid, contentType);
}

export function esPathDeActividad(
  path: string,
  actividadId: string,
  tipo: TipoArchivoActividad,
): boolean {
  return esPathDeArchivo(path, PREFIJO, actividadId, tipo);
}
