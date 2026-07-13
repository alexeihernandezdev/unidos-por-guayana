import Link from "next/link";
import { CalendarDays, MapPin, Target, Truck } from "lucide-react";
import type { Actividad } from "@/modules/actividades/domain/Actividad";
import { esEditable, esEliminable } from "@/modules/actividades/domain/maquinaEstados";
import { Button } from "@/shared/ui/button";
import { PanelList, PanelListRow } from "@/shared/ui/panel";
import { EstadoBadge } from "./EstadoBadge";
import { TipoBadge } from "./TipoBadge";
import { formatearFecha } from "./fechas";

type Props = {
  actividades: Actividad[];
  // Server action (basada en FormData) para eliminar un envío en RECOLECTANDO.
  eliminarAction: (formData: FormData) => Promise<void>;
};

// Listado de actividades como row-cards (feature 026, guía
// `constitution/ui-guidelines.md §5`). Conserva los mismos datos (actividad,
// tipo, destino, fecha, metas, estado) y acciones (Ver / Editar / Eliminar).
export function ActividadesTabla({ actividades, eliminarAction }: Props) {
  if (actividades.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay actividades que coincidan con el filtro.
      </p>
    );
  }

  return (
    <PanelList>
      {actividades.map((ayuda) => (
        <PanelListRow
          key={ayuda.id}
          icon={Truck}
          title={
            <Link
              href={`/panel/actividades/${ayuda.id}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {ayuda.titulo}
            </Link>
          }
          badge={
            <>
              <TipoBadge tipo={ayuda.tipo} />
              <EstadoBadge estado={ayuda.estado} />
            </>
          }
          meta={[
            { icon: MapPin, texto: ayuda.sectorDestino, label: "Destino" },
            {
              icon: CalendarDays,
              texto: (
                <span className="numeric-tnum font-mono">
                  {formatearFecha(ayuda.fecha)}
                </span>
              ),
              label: "Fecha",
            },
            {
              icon: Target,
              texto: (
                <span className="numeric-tnum font-mono">
                  {ayuda.metas.length}
                </span>
              ),
              label: "Metas",
            },
          ]}
          actions={
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/panel/actividades/${ayuda.id}`}>Ver</Link>
              </Button>
              {esEditable(ayuda.estado) && (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/panel/actividades/${ayuda.id}/editar`}>
                    Editar
                  </Link>
                </Button>
              )}
              {esEliminable(ayuda.estado) && (
                <form action={eliminarAction}>
                  <input type="hidden" name="id" value={ayuda.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Eliminar
                  </Button>
                </form>
              )}
            </>
          }
        />
      ))}
    </PanelList>
  );
}
