import type { Aporte } from "@/modules/aportes/domain/Aporte";
import { formatearFecha } from "@/modules/actividades/ui/fechas";

type Props = {
  ingresos: Aporte[];
};

const celda = "px-3 py-2 text-sm align-middle";

function formatearNumero(n: number): string {
  return new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(n);
}

// Tabla de los ingresos monetarios externos ya registrados (feature 014). Es un
// listado de solo lectura: monto, moneda, medio, fecha de recepción y referencia.
export function IngresosMonetariosTabla({ ingresos }: Props) {
  if (ingresos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no has registrado ningún ingreso monetario.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <th className={celda}>Monto</th>
            <th className={celda}>Moneda</th>
            <th className={celda}>Medio</th>
            <th className={celda}>Recibido</th>
            <th className={celda}>Referencia</th>
          </tr>
        </thead>
        <tbody>
          {ingresos.map((ingreso) => (
            <tr
              key={ingreso.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className={`${celda} numeric-tnum font-medium`}>
                {formatearNumero(ingreso.cantidad)}
              </td>
              <td className={`${celda} numeric-tnum`}>
                {ingreso.moneda ?? ""}
              </td>
              <td className={celda}>
                {ingreso.medio?.titular ?? (
                  <span className="text-muted-foreground">Sin especificar</span>
                )}
              </td>
              <td className={`${celda} numeric-tnum`}>
                {ingreso.recibidoEn ? formatearFecha(ingreso.recibidoEn) : ""}
              </td>
              <td className={`${celda} text-muted-foreground`}>
                {ingreso.referencia ?? ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
