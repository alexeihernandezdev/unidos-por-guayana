import Link from "next/link";
import {
  ArrowRightIcon,
  BarChart3,
  CheckCircle2,
  Hourglass,
  ListChecks,
  MapPin,
  PackageCheck,
  PieChart,
  Target,
  TriangleAlert,
} from "lucide-react";
import type { ResumenPanel } from "@/modules/panel/application/obtenerResumenPanel";
import { etiquetaTipo } from "@/modules/actividades/ui/tipos";
import { COLOR_TIPO, ORDEN_TIPOS } from "./coloresGraficos";
import { AccesosDirectos } from "./AccesosDirectos";
import { BloqueEnviosPrioridad } from "./BloqueEnviosPrioridad";
import { BloqueUltimasActividades } from "./BloqueUltimasActividades";
import { GraficoSectoresBarras } from "./GraficoSectoresBarras";
import { GraficoTendenciaBarras } from "./GraficoTendenciaBarras";
import { GraficoTiposDonut } from "./GraficoTiposDonut";
import { TarjetaDestacada } from "./TarjetaDestacada";
import { TarjetaMetrica } from "./TarjetaMetrica";
import { TarjetaPanel } from "./TarjetaPanel";

type Props = {
  resumen: ResumenPanel;
  filtradoPorFecha?: boolean;
};

// Variación mensual de actividades registradas (último mes vs. el previo). Devuelve
// null cuando no hay base de comparación (mes previo en cero y sin actividad este mes).
function calcularDeltaMensual(resumen: ResumenPanel): number | null {
  const serie = resumen.estadisticas.serieMensual;
  const actual = serie.at(-1)?.total ?? 0;
  const previo = serie.at(-2)?.total ?? 0;
  if (previo === 0) return actual > 0 ? 100 : null;
  return Math.round(((actual - previo) / previo) * 100);
}

export function PanelResumen({ resumen, filtradoPorFecha = false }: Props) {
  const { estadisticas, progresoAgregadoRecolectando } = resumen;
  const mesActual = filtradoPorFecha
    ? estadisticas.totalActividades
    : (estadisticas.serieMensual.at(-1)?.total ?? 0);
  const deltaMensual = filtradoPorFecha ? null : calcularDeltaMensual(resumen);
  const urgentes = resumen.solicitudesAbiertasPorUrgencia.ALTA;
  const serieTotales = estadisticas.serieMensual.map((p) => p.total);
  const aportesPendientes = resumen.aportesPendientesConteo;

  // El encabezado (banner) y el padding/ancho los provee la página vía
  // `<PanelPage>` + `<PanelPageHeader>` (feature 026). Aquí solo el cuerpo.
  return (
    <div className="flex flex-col gap-6">
      {/* Fila de indicadores: destacado + tres métricas operativas. */}
      <section
        aria-labelledby="titulo-metricas"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <h2 id="titulo-metricas" className="sr-only">
          Indicadores del panel
        </h2>
        <TarjetaDestacada
          valor={mesActual}
          etiqueta={
            filtradoPorFecha
              ? mesActual === 1
                ? "actividad en el período"
                : "actividades en el período"
              : mesActual === 1
                ? "actividad registrada este mes"
                : "actividades registradas este mes"
          }
          etiquetaPill={filtradoPorFecha ? "Período" : "Este mes"}
          deltaPct={deltaMensual}
          serie={serieTotales}
          href="/panel/actividades"
        />
        <TarjetaMetrica
          etiqueta="Actividades activas"
          valor={resumen.actividadesActivas}
          icono={PackageCheck}
          tono="teal"
          href="/panel/actividades"
          detalle={
            estadisticas.totalActividades > 0 ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {ORDEN_TIPOS.map((tipo) => (
                  <span
                    key={tipo}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <span
                      className="size-2 flex-none rounded-full"
                      style={{ background: COLOR_TIPO[tipo] }}
                      aria-hidden
                    />
                    {etiquetaTipo(tipo)}
                    <span className="numeric-tnum font-mono text-foreground/70">
                      {estadisticas.conteosPorTipo[tipo]}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                todos los tipos
              </span>
            )
          }
        />
        <TarjetaMetrica
          etiqueta="Aportes por confirmar"
          valor={aportesPendientes}
          icono={ListChecks}
          tono={aportesPendientes > 0 ? "warning" : "success"}
          href="/panel/actividades"
          detalle={
            aportesPendientes > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warning-ink">
                <Hourglass strokeWidth={1.5} className="size-3.5" />
                Esperan tu confirmación
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success-ink">
                <CheckCircle2 strokeWidth={1.5} className="size-3.5" />
                Todo al día
              </span>
            )
          }
        />
        <TarjetaMetrica
          etiqueta="Metas al 100 %"
          valor={progresoAgregadoRecolectando.metasAlCien}
          icono={Target}
          tono="success"
          progreso={progresoAgregadoRecolectando.porcentajePromedio}
          subtitulo={`${Math.round(progresoAgregadoRecolectando.porcentajePromedio)} % de avance promedio`}
          href="/panel/actividades?estado=RECOLECTANDO"
        />
      </section>

      <AccesosDirectos />

      {/* Cuerpo en dos columnas: módulos operativos (2/3) + composición (1/3). */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-2">
            <TarjetaPanel
              titulo="Últimas actividades"
              icono={ListChecks}
              accion={
                <Link
                  href="/panel/actividades"
                  className="focus-ring group inline-flex items-center gap-1 font-medium text-primary-ink"
                >
                  Ver todas
                  <ArrowRightIcon
                    strokeWidth={1.5}
                    className="size-3 transition-transform duration-150 group-hover:translate-x-0.5"
                  />
                </Link>
              }
            >
              <BloqueUltimasActividades
                actividades={estadisticas.ultimasActividades}
              />
            </TarjetaPanel>

            <TarjetaPanel
              titulo="Actividades por mes"
              icono={BarChart3}
              accion="Últimos 6 meses"
            >
              <GraficoTendenciaBarras serie={estadisticas.serieMensual} />
            </TarjetaPanel>
          </div>

          <TarjetaPanel
            titulo="Solicitudes por sector"
            icono={MapPin}
            accion={
              urgentes > 0 ? (
                <span className="inline-flex items-center gap-1 font-medium text-destructive">
                  <TriangleAlert strokeWidth={1.5} className="size-3.5" />
                  <span className="numeric-tnum font-mono">{urgentes}</span>
                  {urgentes === 1 ? " urgente" : " urgentes"}
                </span>
              ) : (
                "abiertas"
              )
            }
          >
            <GraficoSectoresBarras sectores={resumen.sectoresTop} />
          </TarjetaPanel>

          <BloqueEnviosPrioridad envios={resumen.enviosPrioridad} />
        </div>

        <aside className="flex flex-col gap-6">
          <TarjetaPanel titulo="Actividades por tipo" icono={PieChart}>
            <GraficoTiposDonut
              conteos={estadisticas.conteosPorTipo}
              total={estadisticas.totalActividades}
            />
          </TarjetaPanel>

          {progresoAgregadoRecolectando.metasBajo > 0 ? (
            <section className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/[0.07] p-5">
              <span
                className="grid size-9 place-items-center rounded-lg bg-warning/20 text-warning-ink"
                aria-hidden
              >
                <Target strokeWidth={1.5} className="size-5" />
              </span>
              <div className="text-sm">
                <p className="font-medium text-foreground/90">
                  Metas por debajo del 100 %
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="numeric-tnum font-mono font-medium text-warning-ink">
                    {progresoAgregadoRecolectando.metasBajo}
                  </span>{" "}
                  metas en recolección necesitan más aportes confirmados para
                  cerrar.
                </p>
              </div>
              <Link
                href="/panel/actividades?estado=RECOLECTANDO"
                className="focus-ring group inline-flex items-center gap-1 text-xs font-medium text-warning-ink"
              >
                Ver actividades en recolección
                <ArrowRightIcon
                  strokeWidth={1.5}
                  className="size-3 transition-transform duration-150 group-hover:translate-x-0.5"
                />
              </Link>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
