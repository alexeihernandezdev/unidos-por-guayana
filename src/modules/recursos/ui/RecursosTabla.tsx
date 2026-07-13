import Link from "next/link";
import { Package, Ruler, Tag } from "lucide-react";
import type { Recurso } from "@/modules/recursos/domain/Recurso";
import { Button } from "@/shared/ui/button";
import {
  PanelBadge,
  PanelList,
  PanelListRow,
} from "@/shared/ui/panel";
import { CATEGORIA_LABEL } from "./categorias";
import { EstadoAprobacionBadge } from "./EstadoAprobacionBadge";

type Props = {
  recursos: Recurso[];
  // Server actions (basadas en FormData) recibidas desde la página. La tabla es un
  // server component; los botones envían un <form> con el id del recurso.
  archivarAction: (formData: FormData) => Promise<void>;
  activarAction: (formData: FormData) => Promise<void>;
};

// Listado de recursos como row-cards (feature 026, guía
// `constitution/ui-guidelines.md §5`). Conserva los mismos datos que la tabla
// anterior (nombre, unidad, categoría, aprobación, estado) y las mismas acciones.
export function RecursosTabla({
  recursos,
  archivarAction,
  activarAction,
}: Props) {
  if (recursos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay recursos que coincidan con el filtro.
      </p>
    );
  }

  return (
    <PanelList>
      {recursos.map((recurso) => (
        <PanelListRow
          key={recurso.id}
          icon={Package}
          title={recurso.nombre}
          badge={
            <>
              <EstadoAprobacionBadge estado={recurso.estadoAprobacion} />
              <PanelBadge tone={recurso.activo ? "active" : "neutral"}>
                {recurso.activo ? "Activo" : "Archivado"}
              </PanelBadge>
            </>
          }
          secondary={recurso.descripcion || undefined}
          meta={[
            { icon: Ruler, texto: recurso.unidad, label: "Unidad" },
            {
              icon: Tag,
              texto: CATEGORIA_LABEL[recurso.categoria],
              label: "Categoría",
            },
          ]}
          actions={
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/panel/recursos/${recurso.id}/editar`}>
                  Editar
                </Link>
              </Button>
              <form action={recurso.activo ? archivarAction : activarAction}>
                <input type="hidden" name="id" value={recurso.id} />
                <Button type="submit" variant="outline" size="sm">
                  {recurso.activo ? "Archivar" : "Activar"}
                </Button>
              </form>
            </>
          }
        />
      ))}
    </PanelList>
  );
}
