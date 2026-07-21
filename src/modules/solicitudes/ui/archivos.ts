import { FileText, Image as ImageIcon, type LucideIcon } from "lucide-react";
import {
  TIPOS_ADJUNTO,
  TIPOS_IMAGEN,
} from "@/modules/solicitudes/domain/reglasArchivos";

// Helpers de presentación de archivos de solicitud (feature 031). Sin estado ni efectos.

/** Tamaño legible en español (KB / MB) a partir de los bytes. */
export function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

/** Ícono según el tipo MIME: imagen o documento. */
export function iconoDeContentType(contentType: string): LucideIcon {
  return contentType.startsWith("image/") ? ImageIcon : FileText;
}

/** Valor del atributo `accept` para el input de imagen principal. */
export const ACCEPT_IMAGEN = TIPOS_IMAGEN.join(",");

/** Valor del atributo `accept` para el input de adjuntos. */
export const ACCEPT_ADJUNTO = TIPOS_ADJUNTO.join(",");
