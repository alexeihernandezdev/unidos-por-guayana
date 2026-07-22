// Reglas de dominio puras para la evidencia de verificación del auditor (feature 032).
// Sin framework ni Prisma. Fuente de verdad de tipos y tamaños; la UI las replica para
// dar feedback, pero el servidor las vuelve a aplicar. A diferencia de los archivos del
// solicitante (031), la evidencia admite VIDEO y un tope de tamaño mucho mayor.

export const MB = 1024 * 1024;
export const MAX_EVIDENCIAS = 15;
// 50 MB: tope del límite global de Storage en el plan Free de Supabase.
export const MAX_BYTES_EVIDENCIA = 50 * MB;

export const TIPOS_IMAGEN: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const TIPOS_VIDEO: readonly string[] = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export const TIPOS_DOCUMENTO: readonly string[] = ["application/pdf"];

// Fotos, capturas, video y PDF de respaldo.
export const TIPOS_EVIDENCIA: readonly string[] = [
  ...TIPOS_IMAGEN,
  ...TIPOS_VIDEO,
  ...TIPOS_DOCUMENTO,
];

const EXTENSION_POR_TIPO: Readonly<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "application/pdf": "pdf",
};

export function extensionDe(contentType: string): string | null {
  return EXTENSION_POR_TIPO[contentType] ?? null;
}

function esTamanoValido(bytes: number, max: number): boolean {
  return Number.isFinite(bytes) && bytes > 0 && bytes <= max;
}

export function esEvidenciaValida(contentType: string, bytes: number): boolean {
  return (
    TIPOS_EVIDENCIA.includes(contentType) &&
    esTamanoValido(bytes, MAX_BYTES_EVIDENCIA)
  );
}

/** ¿Se puede añadir una evidencia más, dado cuántas hay ya? */
export function puedeAgregarEvidencia(cantidadActual: number): boolean {
  return cantidadActual < MAX_EVIDENCIAS;
}

/**
 * Ruta del objeto en el bucket. Bajo el prefijo `auditoria/` para separarla de los
 * archivos del solicitante (`solicitudes/`). El `uuid` lo genera el caso de uso.
 */
export function construirPathEvidencia(
  solicitudId: string,
  uuid: string,
  contentType: string,
): string {
  const ext = extensionDe(contentType) ?? "bin";
  return `auditoria/${solicitudId}/evidencia/${uuid}.${ext}`;
}

/**
 * ¿El `path` pertenece a la carpeta de evidencia de esta solicitud? Defensa contra un
 * cliente que intente confirmar un objeto de otra solicitud o ruta arbitraria.
 */
export function esPathDeEvidencia(path: string, solicitudId: string): boolean {
  return path.startsWith(`auditoria/${solicitudId}/evidencia/`);
}
