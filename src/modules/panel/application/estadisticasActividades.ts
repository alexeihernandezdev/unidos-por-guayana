import { DateTime } from "luxon";
import type { Actividad } from "@/modules/actividades/domain/Actividad";
import type { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import type { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import { TIPOS_ACTIVIDAD } from "@/modules/actividades/domain/TipoActividad";

// Estadísticas de actividades para el panel (dashboard, feature de gráficos). A
// diferencia del resto del resumen (centrado en envíos), estas métricas abarcan los
// tres tipos (ENVIO / JORNADA / EVENTO_SOCIAL). La función es pura: recibe la lista
// ya cargada y la fecha de referencia, así se puede testear sin repositorio ni reloj.

export type ConteosPorTipo = Record<TipoActividad, number>;

// Un punto de la serie temporal: cuántas actividades de cada tipo se registraron en
// ese mes. Las claves de tipo se mantienen en el objeto (no anidadas) para que
// Recharts pueda apilar las barras por `dataKey`.
export type PuntoSerieMensual = {
  /** Clave estable del mes en UTC, p. ej. "2026-07" (para keys de React). */
  clave: string;
  /** Etiqueta corta capitalizada en español, p. ej. "Jul". */
  etiqueta: string;
  ENVIO: number;
  JORNADA: number;
  EVENTO_SOCIAL: number;
  total: number;
};

// Fila del feed "Últimas actividades" (equivalente al listado de transacciones del
// referente). Datos mínimos para la tarjeta; el detalle vive en su propia ruta.
export type ActividadReciente = {
  id: string;
  titulo: string;
  tipo: TipoActividad;
  estado: EstadoActividad;
  sectorDestino: string;
  fecha: Date;
  createdAt: Date;
};

export type EstadisticasActividades = {
  conteosPorTipo: ConteosPorTipo;
  totalActividades: number;
  serieMensual: PuntoSerieMensual[];
  ultimasActividades: ActividadReciente[];
};

const MESES_SERIE = 6;
const LIMITE_RECIENTES = 6;

function conteosPorTipoVacios(): ConteosPorTipo {
  return TIPOS_ACTIVIDAD.reduce((acc, tipo) => {
    acc[tipo] = 0;
    return acc;
  }, {} as ConteosPorTipo);
}

// Luxon en es-VE devuelve el mes corto en minúscula y a veces con punto ("jul.");
// lo normalizamos a "Jul" para las etiquetas del eje.
function etiquetaMes(dt: DateTime): string {
  const corto = dt.setLocale("es-VE").toFormat("LLL").replace(".", "");
  return corto.charAt(0).toUpperCase() + corto.slice(1);
}

/**
 * Deriva las estadísticas de actividades (todos los tipos) a partir de la lista ya
 * cargada. La serie mensual cubre los últimos `MESES_SERIE` meses hasta `ahora`
 * (inclusive), en UTC para no desplazar meses por zona horaria. `ultimasActividades`
 * ordena por `createdAt` descendente (lo más nuevo primero).
 */
export function calcularEstadisticasActividades(
  actividades: readonly Actividad[],
  ahora: Date,
): EstadisticasActividades {
  const conteosPorTipo = conteosPorTipoVacios();
  for (const actividad of actividades) {
    conteosPorTipo[actividad.tipo]++;
  }

  // Buckets de los últimos N meses, del más antiguo al mes actual.
  const mesActual = DateTime.fromJSDate(ahora, { zone: "utc" }).startOf("month");
  const buckets = new Map<string, PuntoSerieMensual>();
  for (let i = MESES_SERIE - 1; i >= 0; i--) {
    const dt = mesActual.minus({ months: i });
    const clave = dt.toFormat("yyyy-MM");
    buckets.set(clave, {
      clave,
      etiqueta: etiquetaMes(dt),
      ENVIO: 0,
      JORNADA: 0,
      EVENTO_SOCIAL: 0,
      total: 0,
    });
  }

  for (const actividad of actividades) {
    const clave = DateTime.fromJSDate(actividad.createdAt, {
      zone: "utc",
    }).toFormat("yyyy-MM");
    const bucket = buckets.get(clave);
    if (!bucket) continue; // fuera de la ventana de N meses
    bucket[actividad.tipo]++;
    bucket.total++;
  }

  const ultimasActividades = [...actividades]
    .toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, LIMITE_RECIENTES)
    .map((a) => ({
      id: a.id,
      titulo: a.titulo,
      tipo: a.tipo,
      estado: a.estado,
      sectorDestino: a.sectorDestino,
      fecha: a.fecha,
      createdAt: a.createdAt,
    }));

  return {
    conteosPorTipo,
    totalActividades: actividades.length,
    serieMensual: [...buckets.values()],
    ultimasActividades,
  };
}
