import { CalendarDays, Hash, Package, UserRound } from "lucide-react";
import { DateTime } from "luxon";
import type { AportanteDeActividad } from "@/modules/aportes/domain/AporteRepository";
import { PanelList, PanelListRow } from "@/shared/ui/panel";
import { EstadoAporteBadge } from "./EstadoAporteBadge";

type Props = {
  aportantes: AportanteDeActividad[];
};

function formatearNumero(n: number): string {
  return new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(n);
}

function formatearFecha(fecha: Date): string {
  return DateTime.fromJSDate(fecha, { zone: "utc" })
    .setLocale("es-VE")
    .toFormat("dd/MM/yyyy");
}

/**
 * Registro de aportantes (feature 023) como row-cards de solo lectura (feature
 * 026, guía `constitution/ui-guidelines.md §5`). Muestra nombre, recurso,
 * cantidad, estado y fecha; sin acciones ni datos de contacto.
 */
export function AportantesTabla({ aportantes }: Props) {
  if (aportantes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay aportes; sé el primero en colaborar.
      </p>
    );
  }

  return (
    <PanelList animated>
      {aportantes.map((a) => (
        <PanelListRow
          key={a.id}
          icon={UserRound}
          title={a.aportanteNombre}
          badge={<EstadoAporteBadge estado={a.estado} />}
          meta={[
            { icon: Package, texto: a.recursoNombre, label: "Recurso" },
            {
              icon: Hash,
              label: "Cantidad",
              texto: (
                <span className="numeric-tnum font-mono">
                  {formatearNumero(a.cantidad)} {a.recursoUnidad}
                </span>
              ),
            },
            {
              icon: CalendarDays,
              label: "Fecha",
              texto: (
                <span className="numeric-tnum font-mono">
                  {formatearFecha(a.fecha)}
                </span>
              ),
            },
          ]}
        />
      ))}
    </PanelList>
  );
}
