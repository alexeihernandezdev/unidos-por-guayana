import { TipoArchivoSolicitud } from "./ArchivoSolicitud";

// Reglas de dominio puras para los archivos de una solicitud (feature 031). Sin
// framework ni Prisma. Son la fuente de verdad de tipos y tamaños permitidos; la UI
// las replica para dar feedback, pero el servidor las vuelve a aplicar.

export const MB = 1024 * 1024;
export const MAX_ADJUNTOS = 10;
export const MAX_BYTES_PRINCIPAL = 5 * MB;
export const MAX_BYTES_ADJUNTO = 10 * MB;

export const TIPOS_IMAGEN: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const TIPOS_DOCUMENTO: readonly string[] = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Un adjunto puede ser imagen o documento; la imagen principal solo imagen.
export const TIPOS_ADJUNTO: readonly string[] = [
  ...TIPOS_IMAGEN,
  ...TIPOS_DOCUMENTO,
];

const EXTENSION_POR_TIPO: Readonly<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

export function extensionDe(contentType: string): string | null {
  return EXTENSION_POR_TIPO[contentType] ?? null;
}

function esTamanoValido(bytes: number, max: number): boolean {
  return Number.isFinite(bytes) && bytes > 0 && bytes <= max;
}

export function esImagenPrincipalValida(
  contentType: string,
  bytes: number,
): boolean {
  return (
    TIPOS_IMAGEN.includes(contentType) &&
    esTamanoValido(bytes, MAX_BYTES_PRINCIPAL)
  );
}

export function esAdjuntoValido(contentType: string, bytes: number): boolean {
  return (
    TIPOS_ADJUNTO.includes(contentType) &&
    esTamanoValido(bytes, MAX_BYTES_ADJUNTO)
  );
}

/** ¿Se puede añadir un adjunto más, dado cuántos hay ya? */
export function puedeAgregarAdjunto(cantidadActual: number): boolean {
  return cantidadActual < MAX_ADJUNTOS;
}

/**
 * Ruta del objeto en el bucket. Determinista dado (`solicitudId`, `tipo`, `uuid`,
 * `contentType`); el `uuid` lo genera el caso de uso para evitar colisiones.
 */
function carpetaDe(tipo: TipoArchivoSolicitud): string {
  return tipo === TipoArchivoSolicitud.PRINCIPAL ? "principal" : "adjuntos";
}

export function construirPath(
  solicitudId: string,
  tipo: TipoArchivoSolicitud,
  uuid: string,
  contentType: string,
): string {
  const ext = extensionDe(contentType) ?? "bin";
  return `solicitudes/${solicitudId}/${carpetaDe(tipo)}/${uuid}.${ext}`;
}

/**
 * ¿El `path` pertenece a la carpeta esperada de esta solicitud y tipo? Defensa contra
 * un cliente que intente confirmar un objeto de otra solicitud o ruta arbitraria.
 */
export function esPathDeSolicitud(
  path: string,
  solicitudId: string,
  tipo: TipoArchivoSolicitud,
): boolean {
  return path.startsWith(`solicitudes/${solicitudId}/${carpetaDe(tipo)}/`);
}
