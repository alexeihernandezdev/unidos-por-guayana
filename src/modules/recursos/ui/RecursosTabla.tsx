import Link from "next/link";
import type { Recurso } from "@/modules/recursos/domain/Recurso";
import { Button } from "@/shared/ui/button";
import { CATEGORIA_LABEL } from "./categorias";
import { EstadoAprobacionBadge } from "./EstadoAprobacionBadge";

type Props = {
  recursos: Recurso[];
  // Server actions (basadas en FormData) recibidas desde la página. La tabla es un
  // server component; los botones envían un <form> con el id del recurso.
  archivarAction: (formData: FormData) => Promise<void>;
  activarAction: (formData: FormData) => Promise<void>;
};

const celda = "px-3 py-3 text-sm align-middle";
const encabezado = "px-3 pb-2 text-xs font-medium text-muted-foreground";

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
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left">
            <th className={encabezado}>Nombre</th>
            <th className={encabezado}>Unidad</th>
            <th className={encabezado}>Categoría</th>
            <th className={encabezado}>Aprobación</th>
            <th className={encabezado}>Estado</th>
            <th className={`${encabezado} text-right`}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {recursos.map((recurso) => (
            <tr
              key={recurso.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className={celda}>
                <span className="font-medium text-foreground">
                  {recurso.nombre}
                </span>
                {recurso.descripcion && (
                  <span className="block text-xs text-muted-foreground [text-wrap:pretty]">
                    {recurso.descripcion}
                  </span>
                )}
              </td>
              <td className={celda}>{recurso.unidad}</td>
              <td className={celda}>{CATEGORIA_LABEL[recurso.categoria]}</td>
              <td className={celda}>
                <EstadoAprobacionBadge estado={recurso.estadoAprobacion} />
              </td>
              <td className={celda}>
                {recurso.activo ? (
                  <span className="text-primary-ink">Activo</span>
                ) : (
                  <span className="text-muted-foreground">Archivado</span>
                )}
              </td>
              <td className={`${celda} text-right`}>
                <div className="flex items-center justify-end gap-2">
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
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
