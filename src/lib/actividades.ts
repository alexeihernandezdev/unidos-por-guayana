import { avanzarEstado } from "@/modules/actividades/application/avanzarEstado";
import {
  crearActividad,
  type CrearActividadInput,
} from "@/modules/actividades/application/crearActividad";
import {
  editarCabecera,
  type EditarCabeceraInput,
} from "@/modules/actividades/application/editarCabecera";
import { eliminarActividad } from "@/modules/actividades/application/eliminarActividad";
import {
  guardarMeta,
  quitarMeta,
} from "@/modules/actividades/application/gestionarMetas";
import { listarActividades } from "@/modules/actividades/application/listarActividades";
import { obtenerActividad } from "@/modules/actividades/application/obtenerActividad";
import {
  prepararSubidaArchivo,
  type PrepararSubidaInput,
  type PreparacionSubida,
} from "@/modules/actividades/application/prepararSubidaArchivo";
import {
  confirmarArchivo,
  type ConfirmarArchivoInput,
} from "@/modules/actividades/application/confirmarArchivo";
import { eliminarArchivo } from "@/modules/actividades/application/eliminarArchivo";
import { urlsPublicasDeActividad } from "@/modules/actividades/application/urlsPublicasDeActividad";
import type { Actividad, NuevaMeta } from "@/modules/actividades/domain/Actividad";
import type { ArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import { TipoArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import type { FiltroActividades } from "@/modules/actividades/domain/ActividadRepository";
import { PrismaActividadRepository } from "@/modules/actividades/infrastructure/PrismaActividadRepository";
import { PrismaRecursoRepository } from "@/modules/recursos/infrastructure/PrismaRecursoRepository";
import { PrismaPuntoAcopioRepository } from "@/modules/acopio/infrastructure/PrismaPuntoAcopioRepository";
import { SupabaseStorageAdapter } from "@/modules/archivos/infrastructure/SupabaseStorageAdapter";

// ── Composition root ────────────────────────────────────────────────────────
// `src/lib` es infraestructura global (tech-stack.md): aquí se cablean los
// repositorios Prisma (actividades + recursos para validar metas contra el catálogo,
// y puntos de acopio para validar el `puntoAcopioId` opcional de la feature 024) con
// los casos de uso puros. Se instancian una sola vez y se reutilizan. La presentación
// consume estos servicios a través de la fachada `@/shared/actividades`.
const actividades = new PrismaActividadRepository();
const recursos = new PrismaRecursoRepository();
const puntos = new PrismaPuntoAcopioRepository();
const deps = { actividades, recursos, puntos };

// Almacenamiento de archivos de actividad (feature 033): bucket PÚBLICO, distinto del
// privado de solicitudes/evidencia. Se sirve por URL pública permanente (transparencia).
const storage = new SupabaseStorageAdapter("SUPABASE_STORAGE_BUCKET_PUBLICO");
const archivoDeps = { actividades, storage };

export function crearActividadServicio(input: CrearActividadInput): Promise<Actividad> {
  return crearActividad(deps, input);
}

export function listarActividadesServicio(filtro?: FiltroActividades): Promise<Actividad[]> {
  return listarActividades(deps, filtro);
}

export function obtenerActividadServicio(
  id: string,
  adminId?: string,
): Promise<Actividad> {
  return obtenerActividad(deps, id, adminId);
}

export function editarCabeceraServicio(
  id: string,
  adminId: string,
  input: EditarCabeceraInput,
): Promise<Actividad> {
  return editarCabecera(deps, id, adminId, input);
}

export function guardarMetaServicio(
  actividadId: string,
  adminId: string,
  meta: NuevaMeta,
): Promise<Actividad> {
  return guardarMeta(deps, actividadId, adminId, meta);
}

export function quitarMetaServicio(
  actividadId: string,
  adminId: string,
  recursoId: string,
): Promise<Actividad> {
  return quitarMeta(deps, actividadId, adminId, recursoId);
}

export function avanzarEstadoServicio(
  id: string,
  adminId: string,
): Promise<Actividad> {
  return avanzarEstado(deps, id, adminId);
}

export function eliminarActividadServicio(
  id: string,
  adminId: string,
): Promise<void> {
  return eliminarActividad(deps, id, adminId);
}

// ── Archivos (feature 033) ──

export function prepararSubidaArchivoServicio(
  input: PrepararSubidaInput,
  actorId: string,
): Promise<PreparacionSubida> {
  return prepararSubidaArchivo(archivoDeps, input, actorId);
}

export function confirmarArchivoServicio(
  input: ConfirmarArchivoInput,
  actorId: string,
): Promise<ArchivoActividad> {
  return confirmarArchivo(archivoDeps, input, actorId);
}

export function eliminarArchivoServicio(
  archivoId: string,
  actorId: string,
): Promise<void> {
  return eliminarArchivo(archivoDeps, archivoId, actorId);
}

// Vista de archivos para los detalles y la transparencia: incluye la URL pública cuando
// el almacenamiento está disponible, y degrada a metadatos sin enlace (`url: null`) si
// falla (p. ej. Supabase sin configurar en local), para no romper la página.
export type ArchivoVista = {
  id: string;
  tipo: TipoArchivoActividad;
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

function sinEnlace(a: ArchivoActividad): ArchivoVista {
  return {
    id: a.id,
    tipo: a.tipo,
    nombreOriginal: a.nombreOriginal,
    contentType: a.contentType,
    tamanoBytes: a.tamanoBytes,
    url: null,
  };
}

export function cargarArchivosVistaServicio(actividad: Actividad): ArchivosVista {
  if (actividad.archivos.length === 0) {
    return { principal: null, adjuntos: [], error: false };
  }
  try {
    const { principal, adjuntos } = urlsPublicasDeActividad(archivoDeps, actividad);
    return { principal, adjuntos, error: false };
  } catch {
    const principal =
      actividad.archivos.find(
        (a) => a.tipo === TipoArchivoActividad.PRINCIPAL,
      ) ?? null;
    return {
      principal: principal ? sinEnlace(principal) : null,
      adjuntos: actividad.archivos
        .filter((a) => a.tipo === TipoArchivoActividad.ADJUNTO)
        .map(sinEnlace),
      error: true,
    };
  }
}

// Portada (URL pública de la imagen PRINCIPAL) de una actividad, o `null` si no tiene o
// si el almacenamiento no está disponible. La usan las tarjetas de transparencia.
export function portadaDeActividad(actividad: Actividad): string | null {
  const principal = actividad.archivos.find(
    (a) => a.tipo === TipoArchivoActividad.PRINCIPAL,
  );
  if (!principal) return null;
  try {
    return storage.urlPublica(principal.path);
  } catch {
    return null;
  }
}
