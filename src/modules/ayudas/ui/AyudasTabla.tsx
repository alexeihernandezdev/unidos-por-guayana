import Link from "next/link";
import type { Ayuda } from "@/modules/ayudas/domain/Ayuda";
import { esEditable, esEliminable } from "@/modules/ayudas/domain/maquinaEstados";
import { Button } from "@/shared/ui/button";
import { EstadoBadge } from "./EstadoBadge";
import { formatearFecha } from "./fechas";

type Props = {
  ayudas: Ayuda[];
  // Server action (basada en FormData) para eliminar un envío en RECOLECTANDO.
  eliminarAction: (formData: FormData) => Promise<void>;
};

const celda = "px-3 py-2 text-sm align-middle";

export function AyudasTabla({ ayudas, eliminarAction }: Props) {
  if (ayudas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay envíos que coincidan con el filtro.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <th className={celda}>Envío</th>
            <th className={celda}>Destino</th>
            <th className={celda}>Fecha</th>
            <th className={celda}>Metas</th>
            <th className={celda}>Estado</th>
            <th className={`${celda} text-right`}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ayudas.map((ayuda) => (
            <tr
              key={ayuda.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className={celda}>
                <Link
                  href={`/panel/ayudas/${ayuda.id}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {ayuda.titulo}
                </Link>
              </td>
              <td className={celda}>{ayuda.sectorDestino}</td>
              <td className={`${celda} numeric-tnum`}>
                {formatearFecha(ayuda.fecha)}
              </td>
              <td className={`${celda} numeric-tnum`}>{ayuda.metas.length}</td>
              <td className={celda}>
                <EstadoBadge estado={ayuda.estado} />
              </td>
              <td className={`${celda} text-right`}>
                <div className="flex items-center justify-end gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/panel/ayudas/${ayuda.id}`}>Ver</Link>
                  </Button>
                  {esEditable(ayuda.estado) && (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/panel/ayudas/${ayuda.id}/editar`}>
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
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
