import { porcentajeGlobalAyuda } from "@/modules/aportes/application/porcentajeGlobalAyuda";
import { progresoDeAyuda } from "@/modules/aportes/application/progresoDeAyuda";
import type { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import type { TipoActividad } from "@/modules/ayudas/domain/TipoActividad";
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
  ayudaId: string;
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  estado: EstadoAyuda;
  tipo: TipoActividad;
  metas: MetaPublica[];
  porcentajeGlobal: number;
};

/** Detalle público de una actividad. `null` si no existe. */
export async function obtenerDetallePublico(
  deps: TransparenciaDeps,
  ayudaId: string,
): Promise<DetallePublico | null> {
  const ayuda = await deps.ayudas.buscarPorId(ayudaId);
  if (!ayuda) return null;

  const progreso = await progresoDeAyuda(deps, ayudaId);
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
    ayudaId: ayuda.id,
    titulo: ayuda.titulo,
    sectorDestino: ayuda.sectorDestino,
    fecha: ayuda.fecha,
    estado: ayuda.estado,
    tipo: ayuda.tipo,
    metas,
    porcentajeGlobal: porcentajeGlobalAyuda(progreso),
  };

  assertSinDatosPersonales(detalle);
  return detalle;
}
