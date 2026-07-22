import {
  cancelarSolicitud,
} from "@/modules/solicitudes/application/cancelarSolicitud";
import {
  cerrarSolicitud,
} from "@/modules/solicitudes/application/cerrarSolicitud";
import {
  crearSolicitud,
  type CrearSolicitudInput,
} from "@/modules/solicitudes/application/crearSolicitud";
import {
  editarSolicitud,
  type EditarSolicitudInput,
} from "@/modules/solicitudes/application/editarSolicitud";
import {
  listarMisSolicitudes,
  listarSolicitudes,
} from "@/modules/solicitudes/application/listarSolicitudes";
import { marcarAtendida } from "@/modules/solicitudes/application/marcarAtendida";
import { obtenerSolicitud } from "@/modules/solicitudes/application/obtenerSolicitud";
import {
  prepararSubidaArchivo,
  type PrepararSubidaInput,
  type PreparacionSubida,
} from "@/modules/solicitudes/application/prepararSubidaArchivo";
import {
  confirmarArchivo,
  type ConfirmarArchivoInput,
} from "@/modules/solicitudes/application/confirmarArchivo";
import { eliminarArchivo } from "@/modules/solicitudes/application/eliminarArchivo";
import {
  urlsLecturaDeSolicitud,
  type ArchivosDeSolicitud,
} from "@/modules/solicitudes/application/urlsLecturaDeSolicitud";
import type { ArchivoSolicitud } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import { TipoArchivoSolicitud } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import type { FiltroSolicitudes } from "@/modules/solicitudes/domain/SolicitudRepository";
import { PrismaSolicitudRepository } from "@/modules/solicitudes/infrastructure/PrismaSolicitudRepository";
import { PrismaRecursoRepository } from "@/modules/recursos/infrastructure/PrismaRecursoRepository";
import { SupabaseStorageAdapter } from "@/modules/archivos/infrastructure/SupabaseStorageAdapter";

const solicitudes = new PrismaSolicitudRepository();
const recursos = new PrismaRecursoRepository();
const storage = new SupabaseStorageAdapter();
const deps = { solicitudes, recursos, storage };

export function crearSolicitudServicio(
  input: CrearSolicitudInput,
  solicitanteId: string,
): Promise<Solicitud> {
  return crearSolicitud(deps, input, solicitanteId);
}

export function listarMisSolicitudesServicio(
  solicitanteId: string,
): Promise<Solicitud[]> {
  return listarMisSolicitudes(deps, solicitanteId);
}

export function listarSolicitudesServicio(
  filtro?: FiltroSolicitudes,
): Promise<Solicitud[]> {
  return listarSolicitudes(deps, filtro);
}

export function obtenerSolicitudServicio(id: string): Promise<Solicitud> {
  return obtenerSolicitud(deps, id);
}

export function editarSolicitudServicio(
  id: string,
  input: EditarSolicitudInput,
  actorId: string,
): Promise<Solicitud> {
  return editarSolicitud(deps, id, input, actorId);
}

export function cancelarSolicitudServicio(
  id: string,
  solicitanteId: string,
): Promise<Solicitud> {
  return cancelarSolicitud(deps, id, solicitanteId);
}

export function marcarAtendidaServicio(id: string): Promise<Solicitud> {
  return marcarAtendida(deps, id);
}

export function cerrarSolicitudServicio(id: string): Promise<Solicitud> {
  return cerrarSolicitud(deps, id);
}

// ── Archivos (feature 031) ──

export function prepararSubidaArchivoServicio(
  input: PrepararSubidaInput,
  actorId: string,
): Promise<PreparacionSubida> {
  return prepararSubidaArchivo(deps, input, actorId);
}

export function confirmarArchivoServicio(
  input: ConfirmarArchivoInput,
  actorId: string,
): Promise<ArchivoSolicitud> {
  return confirmarArchivo(deps, input, actorId);
}

export function eliminarArchivoServicio(
  archivoId: string,
  actorId: string,
): Promise<void> {
  return eliminarArchivo(deps, archivoId, actorId);
}

export function urlsLecturaDeSolicitudServicio(
  solicitud: Solicitud,
): Promise<ArchivosDeSolicitud> {
  return urlsLecturaDeSolicitud(deps, solicitud);
}

// Vista de archivos para los detalles: incluye el enlace firmado cuando el
// almacenamiento está disponible, y degrada a metadatos sin enlace (`url: null`) si
// falla (p. ej. Supabase sin configurar en local), para no romper la página.
export type ArchivoVista = {
  id: string;
  tipo: TipoArchivoSolicitud;
  nombreOriginal: string;
  contentType: string;
  tamanoBytes: number;
  url: string | null;
};

export type ArchivosVista = {
  principal: ArchivoVista | null;
  adjuntos: ArchivoVista[];
  error: boolean;
};

function sinEnlace(a: ArchivoSolicitud): ArchivoVista {
  return {
    id: a.id,
    tipo: a.tipo,
    nombreOriginal: a.nombreOriginal,
    contentType: a.contentType,
    tamanoBytes: a.tamanoBytes,
    url: null,
  };
}

// Portadas para el grid de solicitudes: mapa solicitudId → URL firmada de su imagen
// PRINCIPAL (o ausente si no tiene). Firma en lote; si el almacenamiento no está
// disponible degrada a un mapa vacío (los cards usan placeholder) sin romper la página.
export async function cargarPortadasServicio(
  solicitudes: Solicitud[],
): Promise<Map<string, string>> {
  const conPortada = solicitudes
    .map((s) => {
      const principal = s.archivos.find(
        (a) => a.tipo === TipoArchivoSolicitud.PRINCIPAL,
      );
      return principal ? { id: s.id, path: principal.path } : null;
    })
    .filter((x): x is { id: string; path: string } => x !== null);

  const portadas = new Map<string, string>();
  if (conPortada.length === 0) return portadas;

  try {
    const urls = await Promise.all(
      conPortada.map((x) => storage.crearUrlLecturaFirmada(x.path, 60 * 60)),
    );
    conPortada.forEach((x, i) => portadas.set(x.id, urls[i]));
  } catch {
    // Storage no disponible (p. ej. Supabase sin configurar): sin portadas.
  }
  return portadas;
}

export async function cargarArchivosVistaServicio(
  solicitud: Solicitud,
): Promise<ArchivosVista> {
  if (solicitud.archivos.length === 0) {
    return { principal: null, adjuntos: [], error: false };
  }
  try {
    const { principal, adjuntos } = await urlsLecturaDeSolicitud(
      deps,
      solicitud,
    );
    return { principal, adjuntos, error: false };
  } catch {
    const principal =
      solicitud.archivos.find(
        (a) => a.tipo === TipoArchivoSolicitud.PRINCIPAL,
      ) ?? null;
    return {
      principal: principal ? sinEnlace(principal) : null,
      adjuntos: solicitud.archivos
        .filter((a) => a.tipo === TipoArchivoSolicitud.ADJUNTO)
        .map(sinEnlace),
      error: true,
    };
  }
}
