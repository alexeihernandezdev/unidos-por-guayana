import { porcentajeGlobalActividad } from "@/modules/aportes/application/porcentajeGlobalActividad";
import { progresoDeActividad } from "@/modules/aportes/application/progresoDeActividad";
import type { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import type { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import { TipoArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import {
  assertSinDatosPersonales,
  portadaPublica,
  type TransparenciaDeps,
} from "./obtener-resumen-publico";

export type MetaPublica = {
  recurso: string;
  unidad: string;
  cantidadObjetivo: number;
  cantidadRecibida: number;
  porcentaje: number;
};

// Documento público de una actividad (feature 033). Solo metadatos + URL pública; sin
// datos personales.
export type AdjuntoPublico = {
  id: string;
  nombreOriginal: string;
  contentType: string;
  tamanoBytes: number;
  url: string | null;
};

export type DetallePublico = {
  actividadId: string;
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  estado: EstadoActividad;
  tipo: TipoActividad;
  metas: MetaPublica[];
  porcentajeGlobal: number;
  // Imagen de portada y documentos, públicos (feature 033).
  portadaUrl: string | null;
  adjuntos: AdjuntoPublico[];
};

/** Detalle público de una actividad. `null` si no existe. */
export async function obtenerDetallePublico(
  deps: TransparenciaDeps,
  actividadId: string,
): Promise<DetallePublico | null> {
  const ayuda = await deps.actividades.buscarPorId(actividadId);
  if (!ayuda) return null;

  const progreso = await progresoDeActividad(deps, actividadId);
  const metas = await Promise.all(
    progreso.map(async (meta) => {
      const recurso = await deps.recursos.buscarPorId(meta.recursoId);
      return {
        recurso: recurso?.nombre ?? meta.nombre,
        unidad: recurso?.unidad ?? meta.unidad,
        cantidadObjetivo: meta.objetivo,
        cantidadRecibida: meta.recibido,
        porcentaje: meta.porcentaje,
      };
    }),
  );
  const adjuntos: AdjuntoPublico[] = ayuda.archivos
    .filter((a) => a.tipo === TipoArchivoActividad.ADJUNTO)
    .map((a) => {
      let url: string | null = null;
      try {
        url = deps.storage.urlPublica(a.path);
      } catch {
        url = null;
      }
      return {
        id: a.id,
        nombreOriginal: a.nombreOriginal,
        contentType: a.contentType,
        tamanoBytes: a.tamanoBytes,
        url,
      };
    });

  const detalle: DetallePublico = {
    actividadId: ayuda.id,
    titulo: ayuda.titulo,
    sectorDestino: ayuda.sectorDestino,
    fecha: ayuda.fecha,
    estado: ayuda.estado,
    tipo: ayuda.tipo,
    metas,
    porcentajeGlobal: porcentajeGlobalActividad(progreso),
    portadaUrl: portadaPublica(ayuda.archivos, deps.storage),
    adjuntos,
  };

  assertSinDatosPersonales(detalle);
  return detalle;
}
