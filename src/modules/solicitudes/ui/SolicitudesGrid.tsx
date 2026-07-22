import { Inbox } from "lucide-react";
import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import { PanelEmptyState } from "@/shared/ui/panel";
import { TarjetaSolicitud } from "./TarjetaSolicitud";

type Props = {
  solicitudes: Solicitud[];
  baseRuta: string;
  /** solicitudId → URL firmada de la imagen principal (portada). */
  portadas: Map<string, string>;
};

// Grid de solicitudes como tarjetas con imagen de portada (feature 031/033). Cada
// tarjeta (`TarjetaSolicitud`) hace su propio parallax de entrada ligado al scroll.
export function SolicitudesGrid({ solicitudes, baseRuta, portadas }: Props) {
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {solicitudes.map((solicitud, indice) => (
        <TarjetaSolicitud
          key={solicitud.id}
          solicitud={solicitud}
          href={`${baseRuta}/${solicitud.id}`}
          portada={portadas.get(solicitud.id)}
          indice={indice}
        />
      ))}
    </div>
  );
}
