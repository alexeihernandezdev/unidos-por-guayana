import { DateTime } from "luxon";
import type { AportanteDeAyuda } from "@/modules/aportes/domain/AporteRepository";
import { EstadoAporteBadge } from "./EstadoAporteBadge";

type Props = {
  aportantes: AportanteDeAyuda[];
};

const celda = "px-3 py-2 text-sm align-middle";

function formatearNumero(n: number): string {
  return new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(n);
}

function formatearFecha(fecha: Date): string {
  return DateTime.fromJSDate(fecha, { zone: "utc" })
    .setLocale("es-VE")
    .toFormat("dd/MM/yyyy");
}

/**
 * Tabla de solo lectura del registro de aportantes (feature 023).
 * Muestra nombre, recurso, cantidad, estado y fecha; sin acciones ni datos de contacto.
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
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <th className={celda}>Aportante</th>
            <th className={celda}>Recurso</th>
            <th className={celda}>Cantidad</th>
            <th className={celda}>Estado</th>
            <th className={celda}>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {aportantes.map((a) => (
            <tr
              key={a.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className={`${celda} font-medium`}>{a.aportanteNombre}</td>
              <td className={celda}>{a.recursoNombre}</td>
              <td className={`${celda} numeric-tnum`}>
                {formatearNumero(a.cantidad)} {a.recursoUnidad}
              </td>
              <td className={celda}>
                <EstadoAporteBadge estado={a.estado} />
              </td>
              <td className={`${celda} numeric-tnum text-muted-foreground`}>
                {formatearFecha(a.fecha)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
