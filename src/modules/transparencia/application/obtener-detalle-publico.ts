import { porcentajeGlobalActividad } from "@/modules/aportes/application/porcentajeGlobalActividad";
import { progresoDeActividad } from "@/modules/aportes/application/progresoDeActividad";
import type { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import type { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import {
  assertSinDatosPersonales,
  type TransparenciaDeps,
} from "./obtener-resumen-publico";

export type MetaPublica = {
  recurso: string;
  unidad: string;
  cantidadObjetivo: number;
  cantidadRecibida: number;
  porcentaje: number;
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
  const detalle: DetallePublico = {
    actividadId: ayuda.id,
    titulo: ayuda.titulo,
    sectorDestino: ayuda.sectorDestino,
    fecha: ayuda.fecha,
    estado: ayuda.estado,
    tipo: ayuda.tipo,
    metas,
    porcentajeGlobal: porcentajeGlobalActividad(progreso),
  };

  assertSinDatosPersonales(detalle);
  return detalle;
}
