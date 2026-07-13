import { CalendarDays, Phone, UserRound } from "lucide-react";
import { DateTime } from "luxon";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import type { MiembroRed } from "@/modules/afiliaciones/domain/Afiliacion";
import { Button } from "@/shared/ui/button";
import {
  PanelBadge,
  type PanelBadgeTone,
  PanelList,
  PanelListRow,
} from "@/shared/ui/panel";
import { CATEGORIA_LABEL_CORTA } from "./categorias";

type Props = {
  miembros: MiembroRed[];
  // Server action (FormData con `colaboradorId`) que remueve de la red.
  removerAction: (formData: FormData) => Promise<void>;
};

const VERIFICACION_LABEL: Record<string, string> = {
  VERIFICADO: "Verificado",
  PENDIENTE: "Pendiente",
  RECHAZADO: "Rechazado",
};

const VERIFICACION_TONE: Record<string, PanelBadgeTone> = {
  VERIFICADO: "active",
  PENDIENTE: "warning",
  RECHAZADO: "danger",
};

function fecha(valor: Date): string {
  return DateTime.fromJSDate(valor, { zone: "utc" })
    .setLocale("es-VE")
    .toFormat("dd/MM/yyyy");
}

// Red del ADMIN (feature 025) como row-cards (feature 026, guía
// `constitution/ui-guidelines.md §5`). Conserva datos (nombre, verificación,
// categorías, contacto, fecha) y la acción de remover.
export function RedTabla({ miembros, removerAction }: Props) {
  if (miembros.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay colaboradores afiliados a tu centro con este filtro.
      </p>
    );
  }

  return (
    <PanelList>
      {miembros.map((m) => (
        <PanelListRow
          key={m.colaboradorId}
          icon={UserRound}
          title={m.nombre}
          badge={
            <PanelBadge tone={VERIFICACION_TONE[m.estadoVerificacion] ?? "neutral"}>
              {VERIFICACION_LABEL[m.estadoVerificacion] ?? m.estadoVerificacion}
            </PanelBadge>
          }
          secondary={
            m.categorias.length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {m.categorias.map((c) => (
                  <span
                    key={c}
                    className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs text-primary-ink"
                  >
                    {CATEGORIA_LABEL_CORTA[c as CategoriaRecurso] ?? c}
                  </span>
                ))}
              </span>
            ) : undefined
          }
          meta={[
            {
              icon: Phone,
              label: "Contacto",
              texto: m.telefono
                ? `${m.telefono}${m.telefonoEsWhatsApp ? " (WhatsApp)" : ""}`
                : "Sin teléfono",
            },
            {
              icon: CalendarDays,
              label: "Afiliado el",
              texto: (
                <span className="numeric-tnum font-mono">
                  {fecha(m.afiliadoEn)}
                </span>
              ),
            },
          ]}
          actions={
            <form action={removerAction}>
              <input
                type="hidden"
                name="colaboradorId"
                value={m.colaboradorId}
              />
              <Button type="submit" variant="outline" size="sm">
                Remover de mi red
              </Button>
            </form>
          }
        />
      ))}
    </PanelList>
  );
}
