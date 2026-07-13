import Link from "next/link";
import {
  ArrowRightIcon,
  PackageCheck,
  PackageOpen,
  Target,
  TrendingUp,
  Truck,
} from "lucide-react";
import type { ResumenPanel } from "@/modules/panel/application/obtenerResumenPanel";
import { AccesosDirectos } from "./AccesosDirectos";
import { BloqueAportesPendientes } from "./BloqueAportesPendientes";
import { BloqueEnviosPrioridad } from "./BloqueEnviosPrioridad";
import { BloqueSolicitudesAbiertas } from "./BloqueSolicitudesAbiertas";
import { TarjetaMetrica } from "./TarjetaMetrica";
import { ESTADO_LABEL } from "@/modules/actividades/ui/estados";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";

type Props = {
  resumen: ResumenPanel;
};

export function PanelResumen({ resumen }: Props) {
  const { enviosPorEstado, progresoAgregadoRecolectando } = resumen;

  // El encabezado (banner) y el padding/ancho los provee la página vía
  // `<PanelPage>` + `<PanelPageHeader>` (feature 026). Aquí solo el cuerpo.
  return (
    <div className="flex flex-col gap-8">
      <section
        aria-labelledby="titulo-metricas"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <h2 id="titulo-metricas" className="sr-only">
          Métricas del panel
        </h2>
        <TarjetaMetrica
          etiqueta={ESTADO_LABEL[EstadoActividad.RECOLECTANDO]}
          valor={enviosPorEstado.RECOLECTANDO}
          icono={PackageOpen}
          tono="warning"
          href="/panel/actividades?estado=RECOLECTANDO"
        />
        <TarjetaMetrica
          etiqueta={ESTADO_LABEL[EstadoActividad.LISTO]}
          valor={enviosPorEstado.LISTO}
          icono={PackageCheck}
          tono="teal"
          href="/panel/actividades?estado=LISTO"
        />
        <TarjetaMetrica
          etiqueta={ESTADO_LABEL[EstadoActividad.EN_TRANSITO]}
          valor={enviosPorEstado.EN_TRANSITO}
          icono={Truck}
          tono="accent"
          href="/panel/actividades?estado=EN_TRANSITO"
        />
        <TarjetaMetrica
          etiqueta="Metas al 100 %"
          valor={progresoAgregadoRecolectando.metasAlCien}
          icono={Target}
          tono="success"
          subtitulo={`${Math.round(progresoAgregadoRecolectando.porcentajePromedio)} % promedio`}
          href="/panel/actividades?estado=RECOLECTANDO"
        />
      </section>

      <AccesosDirectos />

      <BloqueEnviosPrioridad envios={resumen.enviosPrioridad} />

      <div className="grid gap-6 lg:grid-cols-2">
        <BloqueSolicitudesAbiertas
          conteos={resumen.solicitudesAbiertasPorUrgencia}
          sectoresTop={resumen.sectoresTop}
        />
        <BloqueAportesPendientes conteo={resumen.aportesPendientesConteo} />
      </div>

      <section className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/[0.07] p-4">
        <span
          className="grid size-9 flex-none place-items-center rounded-lg bg-warning/20 text-warning-ink"
          aria-hidden
        >
          <TrendingUp strokeWidth={1.5} className="size-5" />
        </span>
        <div className="text-xs text-muted-foreground">
          <p className="font-medium text-foreground/80">
            Metas por debajo del 100 %
          </p>
          <p className="mt-1">
            <span className="numeric-tnum font-mono font-medium text-warning-ink">
              {progresoAgregadoRecolectando.metasBajo}
            </span>{" "}
            metas en actividades en recolección necesitan más aportes
            confirmados.
          </p>
          <Link
            href="/panel/actividades?estado=RECOLECTANDO"
            className="focus-ring group mt-2 inline-flex items-center gap-1 font-medium text-warning-ink"
          >
            Ver actividades en recolección
            <ArrowRightIcon
              strokeWidth={1.5}
              className="size-3 transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
