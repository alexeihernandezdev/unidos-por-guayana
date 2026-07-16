import { Filter } from "lucide-react";
import { FiltroSelect } from "@/shared/ui/filtro-select";
import { PanelFilters, PanelFiltersField } from "@/shared/ui/panel";
import { DateRangeFilter } from "./DateRangeFilter";

export type CentroPanelOpcion = { id: string; nombre: string };

type Props = {
  centros: CentroPanelOpcion[];
  centroSeleccionado?: string;
  desde?: string;
  hasta?: string;
};

export function PanelDashboardFilters({
  centros,
  centroSeleccionado,
  desde,
  hasta,
}: Props) {
  const mostrarCentros = centros.length > 1;
  const activos = Number(Boolean(centroSeleccionado)) + Number(Boolean(desde));

  return (
    <section aria-labelledby="dashboard-filters-title">
      <div className="mb-2 flex items-center gap-2">
        <Filter className="size-4 text-primary-ink" aria-hidden />
        <h2 id="dashboard-filters-title" className="text-sm font-medium">
          Alcance del panel
        </h2>
      </div>
      <PanelFilters
        activos={activos}
        limpiarHref="/panel"
        submitLabel="Aplicar filtros"
        className="items-end gap-3 bg-card/70 [&_button]:min-h-11 [&_[data-slot=select-trigger]]:h-11"
      >
        {mostrarCentros ? (
          <PanelFiltersField label="Centro de acopio" className="w-full sm:w-auto">
            <FiltroSelect
              name="centro"
              defaultValue={centroSeleccionado ?? "todos"}
              ariaLabel="Filtrar por centro de acopio"
              className="w-full min-w-60 sm:w-auto"
              opciones={[
                { value: "todos", label: "Todos los centros" },
                ...centros.map((centro) => ({
                  value: centro.id,
                  label: centro.nombre,
                })),
              ]}
            />
          </PanelFiltersField>
        ) : null}
        <PanelFiltersField label="Fecha de la actividad" className="w-full sm:w-auto">
          <DateRangeFilter desde={desde} hasta={hasta} />
        </PanelFiltersField>
      </PanelFilters>
      <p className="mt-2 text-xs text-muted-foreground">
        Las solicitudes por urgencia y sector muestran la red completa.
      </p>
    </section>
  );
}
