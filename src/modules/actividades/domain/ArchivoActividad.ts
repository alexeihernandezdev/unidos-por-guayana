// Archivo de una actividad (feature 033): imagen principal (portada) o documento
// adjunto de apoyo. El binario vive en un bucket PÚBLICO de almacenamiento de objetos;
// aquí el dominio solo modela sus metadatos y la ruta. Los valores del tipo coinciden
// con Prisma (`TipoArchivoActividad`).

export const TipoArchivoActividad = {
  PRINCIPAL: "PRINCIPAL",
  ADJUNTO: "ADJUNTO",
} as const;

export type TipoArchivoActividad =
  (typeof TipoArchivoActividad)[keyof typeof TipoArchivoActividad];

export const TIPOS_ARCHIVO_ACTIVIDAD: readonly TipoArchivoActividad[] =
  Object.values(TipoArchivoActividad);

export function esTipoArchivoActividad(
  valor: string,
): valor is TipoArchivoActividad {
  return (TIPOS_ARCHIVO_ACTIVIDAD as readonly string[]).includes(valor);
}

export type ArchivoActividad = {
  id: string;
  tipo: TipoArchivoActividad;
  path: string;
  nombreOriginal: string;
  contentType: string;
  tamanoBytes: number;
  createdAt: Date;
};

export type NuevoArchivoActividad = {
  actividadId: string;
  tipo: TipoArchivoActividad;
  path: string;
  nombreOriginal: string;
  contentType: string;
  tamanoBytes: number;
};
