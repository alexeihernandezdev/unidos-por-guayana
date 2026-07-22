import {
  FileText,
  Film,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { TIPOS_EVIDENCIA } from "@/modules/auditoria/domain";

// Helpers de presentación de la evidencia de auditoría (feature 032). Sin estado ni efectos.

/** Tamaño legible en español (KB / MB) a partir de los bytes. */
export function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

/** Ícono según el tipo MIME: imagen, video o documento. */
export function iconoDeContentType(contentType: string): LucideIcon {
  if (contentType.startsWith("image/")) return ImageIcon;
  if (contentType.startsWith("video/")) return Film;
  return FileText;
}

/** Valor del atributo `accept` para el input de evidencia. */
export const ACCEPT_EVIDENCIA = TIPOS_EVIDENCIA.join(",");
