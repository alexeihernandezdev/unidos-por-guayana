import Link from "next/link";
import { CalendarDays, Inbox, Package } from "lucide-react";
import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import { esEditable } from "@/modules/solicitudes/domain/maquinaEstados";
import { Button } from "@/shared/ui/button";
import { PanelEmptyState, PanelList, PanelListRow } from "@/shared/ui/panel";
import { EstadoSolicitudBadge } from "./EstadoSolicitudBadge";
import { UrgenciaBadge } from "./UrgenciaBadge";
import { formatearFechaCreacion } from "./fechas";
import { EstadoVerificacionSolicitud } from "@/modules/auditoria/domain";
import { EstadoVerificacionBadge } from "@/modules/auditoria/ui";

type Props = {
  solicitudes: Solicitud[];
  baseRuta: string;
  mostrarSolicitante?: boolean;
};

// Solicitudes como row-cards (feature 026, guía
// `constitution/ui-guidelines.md §5`). Sirve a admin y app vía `baseRuta`.
// Conserva datos (sector, urgencia, recursos, estado, fecha) y acciones.
export function SolicitudesTabla({
  solicitudes,
  baseRuta,
  mostrarSolicitante = false,
}: Props) {
  if (solicitudes.length === 0) {
    return (
      <PanelEmptyState
        bordered={false}
        icon={Inbox}
        title="Sin solicitudes"
        description="No hay solicitudes que coincidan con el filtro."
      />
    );
  }

  return (
    <PanelList>
      {solicitudes.map((solicitud) => (
        <PanelListRow
          key={solicitud.id}
          icon={Inbox}
          title={
            <Link
              href={`${baseRuta}/${solicitud.id}`}
              className="text-foreground underline-offset-4 transition-colors duration-150 hover:text-primary-ink hover:underline"
            >
              {solicitud.sector}
            </Link>
          }
          badge={
            <>
              <UrgenciaBadge urgencia={solicitud.urgencia} />
              <EstadoSolicitudBadge estado={solicitud.estado} />
              <EstadoVerificacionBadge estado={solicitud.estadoVerificacion} />
            </>
          }
          secondary={
            mostrarSolicitante
              ? `${solicitud.descripcion.slice(0, 60)}${solicitud.descripcion.length > 60 ? "…" : ""}`
              : undefined
          }
          meta={[
            {
              icon: Package,
              texto: (
                <span className="numeric-tnum font-mono">
                  {solicitud.recursos.length}
                </span>
              ),
              label: "Recursos",
            },
            {
              icon: CalendarDays,
              texto: (
                <span className="numeric-tnum font-mono">
                  {formatearFechaCreacion(solicitud.createdAt)}
                </span>
              ),
              label: "Creada",
            },
          ]}
          actions={
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={`${baseRuta}/${solicitud.id}`}>Ver</Link>
              </Button>
              {esEditable(solicitud.estado) &&
                solicitud.estadoVerificacion ===
                  EstadoVerificacionSolicitud.REQUIERE_INFORMACION &&
                !mostrarSolicitante && (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`${baseRuta}/${solicitud.id}/editar`}>
                    Editar
                  </Link>
                </Button>
              )}
            </>
          }
        />
      ))}
    </PanelList>
  );
}
