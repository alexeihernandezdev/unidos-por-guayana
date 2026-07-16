import { Gauge } from "lucide-react";
import { DateTime } from "luxon";
import { normalizarFiltrosPanel } from "@/modules/panel/application/normalizarFiltrosPanel";
import { PanelDashboardFilters, PanelResumen } from "@/modules/panel/ui";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarPuntosDeAdminServicio } from "@/shared/acopio";
import { requireRol } from "@/shared/auth";
import { obtenerResumenPanelServicio } from "@/shared/panel";
import { PanelPage, PanelPageHeader } from "@/shared/ui/panel";

type Props = {
  searchParams: Promise<{
    centro?: string | string[];
    desde?: string | string[];
    hasta?: string | string[];
  }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const sesion = await requireRol(Rol.ADMIN);
  const [query, centros] = await Promise.all([
    searchParams,
    listarPuntosDeAdminServicio(sesion.id),
  ]);
  const filtros = normalizarFiltrosPanel(
    query,
    centros.map((centro) => centro.id),
  );
  const resumen = await obtenerResumenPanelServicio(sesion.id, filtros.filtro);

  const partes: string[] = [];
  if (resumen.enviosPorEstado.RECOLECTANDO > 0) {
    partes.push(`${resumen.enviosPorEstado.RECOLECTANDO} por preparar`);
  }
  if (resumen.enviosPorEstado.LISTO > 0) {
    partes.push(`${resumen.enviosPorEstado.LISTO} listos para salir`);
  }
  if (resumen.solicitudesAbiertasPorUrgencia.ALTA > 0) {
    partes.push(
      `${resumen.solicitudesAbiertasPorUrgencia.ALTA} solicitudes urgentes`,
    );
  }
  if (resumen.aportesPendientesConteo > 0) {
    partes.push(`${resumen.aportesPendientesConteo} aportes por confirmar`);
  }

  // Fecha en la eyebrow del banner (reemplaza al DispatchStrip, feature 026).
  // Se formatea en el servidor con zona UTC para evitar hydration mismatch.
  const ahora = DateTime.utc().setLocale("es");
  const fecha = ahora.toFormat("cccc, d 'de' LLLL yyyy");
  const fechaCapital = fecha.charAt(0).toUpperCase() + fecha.slice(1);

  return (
    <PanelPage>
      <PanelPageHeader
        icon={Gauge}
        eyebrow={fechaCapital}
        title="Sala de despacho"
        description="Estado agregado de actividades, solicitudes y aportes. Priorizado por lo que probablemente necesita tu atención en los próximos minutos."
      />

      {partes.length > 0 && (
        <p
          role="status"
          aria-live="polite"
          className="numeric-tnum font-mono text-xs text-foreground/80"
        >
          {partes.join(", ")}
        </p>
      )}

      <PanelDashboardFilters
        centros={centros.map(({ id, nombre, activo }) => ({
          id,
          nombre: activo ? nombre : `${nombre} · Archivado`,
        }))}
        centroSeleccionado={filtros.centro}
        desde={filtros.desde}
        hasta={filtros.hasta}
      />

      <PanelResumen resumen={resumen} filtradoPorFecha={Boolean(filtros.desde)} />
    </PanelPage>
  );
}
