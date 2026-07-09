import Link from "next/link";
import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import { esEditable } from "@/modules/solicitudes/domain/maquinaEstados";
import { Button } from "@/shared/ui/button";
import { EstadoSolicitudBadge } from "./EstadoSolicitudBadge";
import { UrgenciaBadge } from "./UrgenciaBadge";
import { formatearFechaCreacion } from "./fechas";

type Props = {
  solicitudes: Solicitud[];
  baseRuta: string;
  mostrarSolicitante?: boolean;
};

const celda = "px-3 py-2 text-sm align-middle";

export function SolicitudesTabla({
  solicitudes,
  baseRuta,
  mostrarSolicitante = false,
}: Props) {
  if (solicitudes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay solicitudes que coincidan con el filtro.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <th className={celda}>Sector</th>
            <th className={celda}>Urgencia</th>
            <th className={celda}>Recursos</th>
            <th className={celda}>Estado</th>
            <th className={celda}>Creada</th>
            <th className={`${celda} text-right`}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((solicitud) => (
            <tr
              key={solicitud.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className={celda}>
                <Link
                  href={`${baseRuta}/${solicitud.id}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {solicitud.sector}
                </Link>
                {mostrarSolicitante && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {solicitud.descripcion.slice(0, 60)}
                    {solicitud.descripcion.length > 60 ? "…" : ""}
                  </p>
                )}
              </td>
              <td className={celda}>
                <UrgenciaBadge urgencia={solicitud.urgencia} />
              </td>
              <td className={`${celda} numeric-tnum`}>
                {solicitud.recursos.length}
              </td>
              <td className={celda}>
                <EstadoSolicitudBadge estado={solicitud.estado} />
              </td>
              <td className={`${celda} numeric-tnum`}>
                {formatearFechaCreacion(solicitud.createdAt)}
              </td>
              <td className={`${celda} text-right`}>
                <div className="flex items-center justify-end gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`${baseRuta}/${solicitud.id}`}>Ver</Link>
                  </Button>
                  {esEditable(solicitud.estado) && !mostrarSolicitante && (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`${baseRuta}/${solicitud.id}/editar`}>
                        Editar
                      </Link>
                    </Button>
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
