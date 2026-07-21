// Archivo de una solicitud (feature 031): imagen principal (portada) o documento
// adjunto de apoyo. El binario vive en el almacenamiento de objetos; aquí el dominio
// solo modela sus metadatos y la ruta. Los valores del tipo coinciden con Prisma.

export const TipoArchivoSolicitud = {
  PRINCIPAL: "PRINCIPAL",
  ADJUNTO: "ADJUNTO",
} as const;

export type TipoArchivoSolicitud =
  (typeof TipoArchivoSolicitud)[keyof typeof TipoArchivoSolicitud];

export const TIPOS_ARCHIVO_SOLICITUD: readonly TipoArchivoSolicitud[] =
  Object.values(TipoArchivoSolicitud);

export function esTipoArchivoSolicitud(
  valor: string,
): valor is TipoArchivoSolicitud {
  return (TIPOS_ARCHIVO_SOLICITUD as readonly string[]).includes(valor);
}

export type ArchivoSolicitud = {
  id: string;
  tipo: TipoArchivoSolicitud;
  path: string;
  nombreOriginal: string;
  contentType: string;
  tamanoBytes: number;
  createdAt: Date;
};

export type NuevoArchivoSolicitud = {
  solicitudId: string;
  tipo: TipoArchivoSolicitud;
  path: string;
  nombreOriginal: string;
  contentType: string;
  tamanoBytes: number;
};
