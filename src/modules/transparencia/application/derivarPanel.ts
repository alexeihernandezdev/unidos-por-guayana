import { DateTime } from "luxon";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import type { EstadoActividad as EstadoActividadType } from "@/modules/actividades/domain/EstadoActividad";
import { TIPOS_ACTIVIDAD } from "@/modules/actividades/domain/TipoActividad";
import type { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import type {
  EnvioResumenPublico,
  ResumenPublico,
} from "./obtener-resumen-publico";

// Vista-modelo del tablero público (feature de rediseño de transparencia). Deriva de
// forma **pura** las series y métricas que alimentan el "command center" (contadores,
// donut, barras, área temporal, franja de fases) a partir del `ResumenPublico` que ya
// viaja al cliente. No añade lógica de dominio: solo agrupa y cuenta lo ya expuesto, y
// no toca datos personales (el DTO de origen ya pasó `assertSinDatosPersonales`). Al ser
// pura y determinista (el rango temporal sale de las propias fechas, no del reloj) se
// testea sin repositorio ni `Date.now`.

// Fase operativa canónica: colapsa las dos secuencias de estado (envío y evento/jornada)
// en cuatro etapas comparables, para leer "en qué punto está la operación" de un vistazo.
export type FaseOperativa =
  | "RECOLECTANDO"
  | "PREPARADO"
  | "EN_MARCHA"
  | "CUMPLIDO";

export const ORDEN_FASES: readonly FaseOperativa[] = [
  "RECOLECTANDO",
  "PREPARADO",
  "EN_MARCHA",
  "CUMPLIDO",
] as const;

export const FASE_ETIQUETA: Record<FaseOperativa, string> = {
  RECOLECTANDO: "Recolectando",
  PREPARADO: "Preparado",
  EN_MARCHA: "En marcha",
  CUMPLIDO: "Cumplido",
};

const ESTADO_A_FASE: Record<EstadoActividadType, FaseOperativa> = {
  [EstadoActividad.RECOLECTANDO]: "RECOLECTANDO",
  [EstadoActividad.LISTO]: "PREPARADO",
  [EstadoActividad.LISTA]: "PREPARADO",
  [EstadoActividad.EN_TRANSITO]: "EN_MARCHA",
  [EstadoActividad.EN_CURSO]: "EN_MARCHA",
  [EstadoActividad.ENTREGADO]: "CUMPLIDO",
  [EstadoActividad.REALIZADA]: "CUMPLIDO",
};

export type KpisTablero = {
  actividades: number;
  cumplidas: number;
  aportesConfirmados: number;
  sectoresAlcanzados: number;
  /** Promedio de avance confirmado (0-100), redondeado. */
  avancePromedio: number;
};

export type ConteoTipo = { tipo: TipoActividad; valor: number };
export type ConteoFase = { fase: FaseOperativa; valor: number };
export type ResumenSector = {
  sector: string;
  conteo: number;
  avancePromedio: number;
};
export type PuntoTemporal = { clave: string; etiqueta: string; valor: number };

export type PanelTransparencia = {
  kpis: KpisTablero;
  porTipo: ConteoTipo[];
  fases: ConteoFase[];
  sectores: ResumenSector[];
  serieMensual: PuntoTemporal[];
};

const LIMITE_SECTORES = 6;
const MAX_MESES_SERIE = 12;

function normalizarPorcentaje(p: number): number {
  if (!Number.isFinite(p) || p < 0) return 0;
  return Math.min(100, p);
}

function etiquetaMes(dt: DateTime): string {
  const corto = dt.setLocale("es-VE").toFormat("LLL").replace(".", "");
  return corto.charAt(0).toUpperCase() + corto.slice(1);
}

function derivarKpis(
  envios: EnvioResumenPublico[],
  resumen: ResumenPublico,
): KpisTablero {
  const cumplidas = envios.filter(
    (e) => ESTADO_A_FASE[e.estado] === "CUMPLIDO",
  ).length;
  const sectores = new Set(envios.map((e) => e.sectorDestino.trim()));
  const avancePromedio =
    envios.length === 0
      ? 0
      : Math.round(
          envios.reduce((acc, e) => acc + normalizarPorcentaje(e.porcentaje), 0) /
            envios.length,
        );

  return {
    actividades: resumen.totales.enviosTotal,
    cumplidas,
    aportesConfirmados: resumen.totales.aportesConfirmados,
    sectoresAlcanzados: sectores.size,
    avancePromedio,
  };
}

function derivarPorTipo(envios: EnvioResumenPublico[]): ConteoTipo[] {
  const conteos = new Map<TipoActividad, number>(
    TIPOS_ACTIVIDAD.map((t) => [t, 0]),
  );
  for (const e of envios) conteos.set(e.tipo, (conteos.get(e.tipo) ?? 0) + 1);
  return TIPOS_ACTIVIDAD.map((tipo) => ({ tipo, valor: conteos.get(tipo) ?? 0 }));
}

function derivarFases(envios: EnvioResumenPublico[]): ConteoFase[] {
  const conteos = new Map<FaseOperativa, number>(
    ORDEN_FASES.map((f) => [f, 0]),
  );
  for (const e of envios) {
    const fase = ESTADO_A_FASE[e.estado];
    conteos.set(fase, (conteos.get(fase) ?? 0) + 1);
  }
  return ORDEN_FASES.map((fase) => ({ fase, valor: conteos.get(fase) ?? 0 }));
}

function derivarSectores(envios: EnvioResumenPublico[]): ResumenSector[] {
  const porSector = new Map<string, { conteo: number; suma: number }>();
  for (const e of envios) {
    const clave = e.sectorDestino.trim();
    const previo = porSector.get(clave) ?? { conteo: 0, suma: 0 };
    porSector.set(clave, {
      conteo: previo.conteo + 1,
      suma: previo.suma + normalizarPorcentaje(e.porcentaje),
    });
  }
  return [...porSector.entries()]
    .map(([sector, { conteo, suma }]) => ({
      sector,
      conteo,
      avancePromedio: Math.round(suma / conteo),
    }))
    .sort((a, b) => b.conteo - a.conteo || b.avancePromedio - a.avancePromedio)
    .slice(0, LIMITE_SECTORES);
}

// Serie mensual continua entre el mes más antiguo y el más reciente presente en los
// datos (en UTC, para no desplazar meses por zona horaria). Rellena los huecos con 0 para
// que el área no salte, y limita la ventana a los últimos `MAX_MESES_SERIE` meses del
// rango si fuese muy largo. Devuelve [] si no hay actividades.
function derivarSerieMensual(envios: EnvioResumenPublico[]): PuntoTemporal[] {
  if (envios.length === 0) return [];

  const meses = envios.map((e) =>
    DateTime.fromJSDate(e.fecha, { zone: "utc" }).startOf("month"),
  );
  const min = meses.reduce((a, b) => (b < a ? b : a));
  const max = meses.reduce((a, b) => (b > a ? b : a));

  const total = Math.min(
    MAX_MESES_SERIE,
    Math.round(max.diff(min, "months").months) + 1,
  );
  const inicio = max.minus({ months: total - 1 });

  const buckets = new Map<string, PuntoTemporal>();
  for (let i = 0; i < total; i++) {
    const dt = inicio.plus({ months: i });
    const clave = dt.toFormat("yyyy-MM");
    buckets.set(clave, { clave, etiqueta: etiquetaMes(dt), valor: 0 });
  }
  for (const dt of meses) {
    const bucket = buckets.get(dt.toFormat("yyyy-MM"));
    if (bucket) bucket.valor += 1;
  }
  return [...buckets.values()];
}

/** Deriva el vista-modelo del tablero público a partir del resumen ya cargado. */
export function derivarPanel(resumen: ResumenPublico): PanelTransparencia {
  const { envios } = resumen;
  return {
    kpis: derivarKpis(envios, resumen),
    porTipo: derivarPorTipo(envios),
    fases: derivarFases(envios),
    sectores: derivarSectores(envios),
    serieMensual: derivarSerieMensual(envios),
  };
}
