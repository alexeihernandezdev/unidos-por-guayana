import type { ArchivoSolicitud } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import { TipoArchivoSolicitud } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import type { ArchivoSolicitudDeps } from "./deps";

// Vigencia de las URLs firmadas de lectura: 1 hora. Suficiente para ver/descargar en la
// sesión actual sin dejar enlaces perpetuos (bucket privado).
const EXPIRA_LECTURA_SEGUNDOS = 60 * 60;

export type ArchivoConUrl = ArchivoSolicitud & { url: string };

export type ArchivosDeSolicitud = {
  principal: ArchivoConUrl | null;
  adjuntos: ArchivoConUrl[];
};

/**
 * Resuelve las URLs firmadas de lectura de todos los archivos de una solicitud, separadas
 * en imagen principal y adjuntos. Lo consumen los detalles (dueño y admin) al renderizar.
 */
export async function urlsLecturaDeSolicitud(
  { storage }: ArchivoSolicitudDeps,
  solicitud: Solicitud,
): Promise<ArchivosDeSolicitud> {
  const conUrl: ArchivoConUrl[] = await Promise.all(
    solicitud.archivos.map(async (archivo) => ({
      ...archivo,
      url: await storage.crearUrlLecturaFirmada(
        archivo.path,
        EXPIRA_LECTURA_SEGUNDOS,
      ),
    })),
  );

  return {
    principal:
      conUrl.find((a) => a.tipo === TipoArchivoSolicitud.PRINCIPAL) ?? null,
    adjuntos: conUrl.filter((a) => a.tipo === TipoArchivoSolicitud.ADJUNTO),
  };
}
