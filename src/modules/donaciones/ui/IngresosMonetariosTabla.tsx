import { CalendarDays, Coins, Hash, Landmark } from "lucide-react";
import type { Aporte } from "@/modules/aportes/domain/Aporte";
import { formatearFecha } from "@/modules/actividades/ui/fechas";
import { PanelList, PanelListRow } from "@/shared/ui/panel";

type Props = {
  ingresos: Aporte[];
};

function formatearNumero(n: number): string {
  return new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(n);
}

// Ingresos monetarios externos como row-cards (feature 026, guía
// `constitution/ui-guidelines.md §5`). Solo lectura: monto, moneda, medio,
// fecha de recepción y referencia. El monto (dato numérico principal) va en
// `font-mono` + `numeric-tnum`.
export function IngresosMonetariosTabla({ ingresos }: Props) {
  if (ingresos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no has registrado ningún ingreso monetario.
      </p>
    );
  }

  return (
    <PanelList>
      {ingresos.map((ingreso) => (
        <PanelListRow
          key={ingreso.id}
          icon={Coins}
          title={
            <span className="numeric-tnum font-mono">
              {formatearNumero(ingreso.cantidad)} {ingreso.moneda ?? ""}
            </span>
          }
          meta={[
            {
              icon: Landmark,
              texto: ingreso.medio?.titular ?? "Sin especificar",
              label: "Medio",
            },
            {
              icon: CalendarDays,
              label: "Recibido",
              texto: ingreso.recibidoEn ? (
                <span className="numeric-tnum font-mono">
                  {formatearFecha(ingreso.recibidoEn)}
                </span>
              ) : (
                "—"
              ),
            },
            {
              icon: Hash,
              texto: ingreso.referencia || "—",
              label: "Referencia",
            },
          ]}
        />
      ))}
    </PanelList>
  );
}
