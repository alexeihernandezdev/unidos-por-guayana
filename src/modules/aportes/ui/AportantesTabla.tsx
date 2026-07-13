import { DateTime } from "luxon";
import type { AportanteDeActividad } from "@/modules/aportes/domain/AporteRepository";
import { EstadoAporteBadge } from "./EstadoAporteBadge";

type Props = {
  aportantes: AportanteDeActividad[];
};

const celda = "px-3 py-3 text-sm align-middle";
const encabezado = "px-3 pb-2 text-xs font-medium text-muted-foreground";

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
          <tr className="border-b border-border text-left">
            <th className={encabezado}>Aportante</th>
            <th className={encabezado}>Recurso</th>
            <th className={`${encabezado} text-right`}>Cantidad</th>
            <th className={encabezado}>Estado</th>
            <th className={`${encabezado} text-right`}>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {aportantes.map((a) => (
            <tr
              key={a.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className={`${celda} font-medium text-foreground`}>
                {a.aportanteNombre}
              </td>
              <td className={`${celda} text-foreground`}>{a.recursoNombre}</td>
              <td className={`${celda} numeric-tnum text-right`}>
                {formatearNumero(a.cantidad)}{" "}
                <span className="text-muted-foreground">{a.recursoUnidad}</span>
              </td>
              <td className={celda}>
                <EstadoAporteBadge estado={a.estado} />
              </td>
              <td className={`${celda} numeric-tnum text-right text-muted-foreground`}>
                {formatearFecha(a.fecha)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
