import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
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
          href="/panel/actividades?estado=RECOLECTANDO"
        />
        <TarjetaMetrica
          etiqueta={ESTADO_LABEL[EstadoActividad.LISTO]}
          valor={enviosPorEstado.LISTO}
          href="/panel/actividades?estado=LISTO"
        />
        <TarjetaMetrica
          etiqueta={ESTADO_LABEL[EstadoActividad.EN_TRANSITO]}
          valor={enviosPorEstado.EN_TRANSITO}
          href="/panel/actividades?estado=EN_TRANSITO"
        />
        <TarjetaMetrica
          etiqueta="Metas al 100 %"
          valor={progresoAgregadoRecolectando.metasAlCien}
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

      <section className="rounded-lg border border-border p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground/80">Metas por debajo del 100 %</p>
        <p className="mt-1">
          {progresoAgregadoRecolectando.metasBajo} metas en actividades en
          recolección necesitan más aportes confirmados.
        </p>
        <Link
          href="/panel/actividades?estado=RECOLECTANDO"
          className="focus-ring mt-2 inline-flex items-center gap-1 text-accent hover:underline"
        >
          Ver actividades en recolección
          <ArrowRightIcon strokeWidth={1.5} className="size-3" />
        </Link>
      </section>
    </div>
  );
}
