import Link from "next/link";
import { CalendarDays, Package, Ruler, Tag } from "lucide-react";
import { DateTime } from "luxon";
import type { Recurso } from "@/modules/recursos/domain/Recurso";
import { Button } from "@/shared/ui/button";
import { PanelList, PanelListRow } from "@/shared/ui/panel";
import { CATEGORIA_LABEL } from "./categorias";

type Props = {
  propuestas: Recurso[];
  aprobarAction: (formData: FormData) => Promise<void>;
  rechazarAction: (formData: FormData) => Promise<void>;
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
}: Props) {
  if (propuestas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay propuestas pendientes de revisión.
      </p>
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
              <Button asChild variant="ghost" size="sm">
                <Link href={`/panel/recursos/${recurso.id}/editar`}>
                  Ajustar
                </Link>
              </Button>
              <form action={aprobarAction}>
                <input type="hidden" name="id" value={recurso.id} />
                <Button type="submit" size="sm">
                  Aprobar
                </Button>
              </form>
              <form action={rechazarAction}>
                <input type="hidden" name="id" value={recurso.id} />
                <Button type="submit" variant="outline" size="sm">
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
