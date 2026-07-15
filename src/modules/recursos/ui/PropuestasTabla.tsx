"use client";

import { CalendarDays, Package, Ruler, Tag } from "lucide-react";
import { DateTime } from "luxon";
import type { Recurso } from "@/modules/recursos/domain/Recurso";
import { Button } from "@/shared/ui/button";
import { PanelEmptyState, PanelList, PanelListRow } from "@/shared/ui/panel";
import { CATEGORIA_LABEL } from "./categorias";

type Props = {
  propuestas: Recurso[];
  aprobarAction: (formData: FormData) => Promise<void>;
  rechazarAction: (formData: FormData) => Promise<void>;
  onAjustar: (recurso: Recurso) => void;
};

function formatearFecha(fecha: Date): string {
  return DateTime.fromJSDate(fecha, { zone: "utc" })
    .setLocale("es-VE")
    .toFormat("dd/MM/yyyy");
}

// Propuestas de recursos como row-cards (feature 026, guía
// `constitution/ui-guidelines.md §5`). Conserva datos (nombre, unidad,
// categoría, fecha) y acciones (Ajustar / Aprobar / Rechazar).
export function PropuestasTabla({
  propuestas,
  aprobarAction,
  rechazarAction,
  onAjustar,
}: Props) {
  if (propuestas.length === 0) {
    return (
      <PanelEmptyState
        bordered={false}
        icon={Package}
        title="Sin propuestas pendientes"
        description="Cuando un solicitante proponga un recurso nuevo, aparecerá aquí para revisarlo."
      />
    );
  }

  return (
    <PanelList>
      {propuestas.map((recurso) => (
        <PanelListRow
          key={recurso.id}
          icon={Package}
          title={recurso.nombre}
          secondary={recurso.descripcion || undefined}
          meta={[
            { icon: Ruler, texto: recurso.unidad, label: "Unidad" },
            {
              icon: Tag,
              texto: CATEGORIA_LABEL[recurso.categoria],
              label: "Categoría",
            },
            {
              icon: CalendarDays,
              texto: (
                <span className="numeric-tnum font-mono">
                  {formatearFecha(recurso.createdAt)}
                </span>
              ),
              label: "Propuesto",
            },
          ]}
          actions={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAjustar(recurso)}
              >
                Ajustar
              </Button>
              <form action={aprobarAction}>
                <input type="hidden" name="id" value={recurso.id} />
                <Button type="submit" size="sm">
                  Aprobar
                </Button>
              </form>
              <form action={rechazarAction}>
                <input type="hidden" name="id" value={recurso.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Rechazar
                </Button>
              </form>
            </>
          }
        />
      ))}
    </PanelList>
  );
}
