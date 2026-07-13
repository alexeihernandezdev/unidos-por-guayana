import type { Aporte } from "@/modules/aportes/domain/Aporte";
import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import { Button } from "@/shared/ui/button";
import { EstadoAporteBadge } from "./EstadoAporteBadge";

type Props = {
  aportes: Aporte[];
  // Server actions inyectadas desde la página (server component) para no acoplar
  // el componente a rutas concretas.
  marcarRecibidoAction: (formData: FormData) => Promise<void>;
  revertirRecibidoAction: (formData: FormData) => Promise<void>;
  cancelarAporteAction: (formData: FormData) => Promise<void>;
};

const celda = "px-3 py-3 text-sm align-middle";
const encabezado = "px-3 pb-2 text-xs font-medium text-muted-foreground";

function formatearNumero(n: number): string {
  return new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(n);
}

export function AportesTabla({
  aportes,
  marcarRecibidoAction,
  revertirRecibidoAction,
  cancelarAporteAction,
}: Props) {
  if (aportes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay aportes para esta actividad.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left">
            <th className={encabezado}>Colaborador</th>
            <th className={encabezado}>Recurso</th>
            <th className={`${encabezado} text-right`}>Cantidad</th>
            <th className={encabezado}>Nota</th>
            <th className={encabezado}>Estado</th>
            <th className={encabezado}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {aportes.map((a) => (
            <tr
              key={a.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className={celda}>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">
                    {a.colaborador?.nombre ?? "(colaborador)"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {a.colaborador?.email ?? ""}
                  </span>
                </div>
              </td>
              <td className={`${celda} text-foreground`}>
                {a.recurso?.nombre ?? "(recurso)"}
              </td>
              <td className={`${celda} numeric-tnum text-right`}>
                {formatearNumero(a.cantidad)}{" "}
                <span className="text-muted-foreground">
                  {a.recurso?.unidad ?? ""}
                </span>
              </td>
              <td className={`${celda} text-muted-foreground`}>
                {a.nota ?? ""}
              </td>
              <td className={celda}>
                <EstadoAporteBadge estado={a.estado} />
              </td>
              <td className={celda}>
                <div className="flex flex-wrap items-center gap-2">
                  {a.estado === EstadoAporte.COMPROMETIDO && (
                    <>
                      <form action={marcarRecibidoAction}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="actividadId" value={a.actividadId ?? ""} />
                        <Button type="submit" size="sm">
                          Marcar recibido
                        </Button>
                      </form>
                      <form action={cancelarAporteAction}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="actividadId" value={a.actividadId ?? ""} />
                        <Button type="submit" variant="ghost" size="sm">
                          Cancelar
                        </Button>
                      </form>
                    </>
                  )}
                  {a.estado === EstadoAporte.RECIBIDO && (
                    <form action={revertirRecibidoAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="actividadId" value={a.actividadId ?? ""} />
                      <Button type="submit" variant="outline" size="sm">
                        Revertir
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
