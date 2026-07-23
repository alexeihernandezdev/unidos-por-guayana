import type { ArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import { TipoArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import type { Actividad } from "@/modules/actividades/domain/Actividad";
import type { ArchivoActividadDeps } from "./deps";

export type ArchivoConUrl = ArchivoActividad & { url: string };

export type ArchivosDeActividad = {
  principal: ArchivoConUrl | null;
  adjuntos: ArchivoConUrl[];
};

/**
 * Resuelve las URLs PÚBLICAS de todos los archivos de una actividad (feature 033),
 * separadas en imagen principal y adjuntos. A diferencia de solicitudes (URLs firmadas
 * de corta vida), aquí el bucket es público y la URL es permanente, apta para la
 * transparencia sin sesión. No hace red: `urlPublica` construye la URL a partir del path.
 */
export function urlsPublicasDeActividad(
  { storage }: ArchivoActividadDeps,
  actividad: Actividad,
): ArchivosDeActividad {
  const conUrl: ArchivoConUrl[] = actividad.archivos.map((archivo) => ({
    ...archivo,
    url: storage.urlPublica(archivo.path),
  }));

  return {
    principal:
      conUrl.find((a) => a.tipo === TipoArchivoActividad.PRINCIPAL) ?? null,
    adjuntos: conUrl.filter((a) => a.tipo === TipoArchivoActividad.ADJUNTO),
  };
}
