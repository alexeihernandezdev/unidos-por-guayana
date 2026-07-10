import Link from "next/link";
import { DateTime } from "luxon";
import type { Recurso } from "@/modules/recursos/domain/Recurso";
import { Button } from "@/shared/ui/button";
import { CATEGORIA_LABEL } from "./categorias";

type Props = {
  propuestas: Recurso[];
  aprobarAction: (formData: FormData) => Promise<void>;
  rechazarAction: (formData: FormData) => Promise<void>;
};

const celda = "px-3 py-2 text-sm align-middle";

function formatearFecha(fecha: Date): string {
  return DateTime.fromJSDate(fecha, { zone: "utc" })
    .setLocale("es-VE")
    .toFormat("dd/MM/yyyy");
}

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
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <th className={celda}>Nombre</th>
            <th className={celda}>Unidad</th>
            <th className={celda}>Categoría</th>
            <th className={celda}>Propuesto</th>
            <th className={`${celda} text-right`}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {propuestas.map((recurso) => (
            <tr
              key={recurso.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className={celda}>
                <span className="font-medium">{recurso.nombre}</span>
                {recurso.descripcion && (
                  <span className="block text-xs text-muted-foreground">
                    {recurso.descripcion}
                  </span>
                )}
              </td>
              <td className={celda}>{recurso.unidad}</td>
              <td className={celda}>{CATEGORIA_LABEL[recurso.categoria]}</td>
              <td className={`${celda} numeric-tnum`}>
                {formatearFecha(recurso.createdAt)}
              </td>
              <td className={`${celda} text-right`}>
                <div className="flex flex-wrap items-center justify-end gap-2">
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
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
