import { Inbox } from "lucide-react";
import {
  esEstadoSolicitud,
  ESTADOS_SOLICITUD,
} from "@/modules/solicitudes/domain/EstadoSolicitud";
import {
  esUrgenciaSolicitud,
  URGENCIAS_SOLICITUD,
} from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import type { FiltroSolicitudes } from "@/modules/solicitudes/domain/SolicitudRepository";
import { SolicitudesTabla } from "@/modules/solicitudes/ui/SolicitudesTabla";
import { ESTADO_LABEL } from "@/modules/solicitudes/ui/estados";
import { URGENCIA_LABEL } from "@/modules/solicitudes/ui/urgencias";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarSolicitudesServicio } from "@/shared/solicitudes";
import { requireRol } from "@/shared/auth";
import { FiltroSelect } from "@/shared/ui/filtro-select";
import { Input } from "@/shared/ui/input";
import {
  PanelFilters,
  PanelFiltersField,
  PanelPage,
  PanelPageHeader,
} from "@/shared/ui/panel";

type Props = {
  searchParams: Promise<{
    sector?: string;
    urgencia?: string;
    estado?: string;
  }>;
};

export default async function SolicitudesAdminPage({ searchParams }: Props) {
  await requireRol(Rol.ADMIN);

  const { sector, urgencia, estado } = await searchParams;

  const filtro: FiltroSolicitudes = {};
  if (sector?.trim()) filtro.sector = sector.trim();
  if (urgencia && esUrgenciaSolicitud(urgencia)) filtro.urgencia = urgencia;
  if (estado && esEstadoSolicitud(estado)) filtro.estado = estado;

  const solicitudes = await listarSolicitudesServicio(filtro);

  return (
    <PanelPage>
      <PanelPageHeader
        icon={Inbox}
        eyebrow="Operación"
        title="Solicitudes de ayuda"
        description="Peticiones del terreno: sector, urgencia y recursos necesarios."
      />

      <PanelFilters
        activos={
          [filtro.sector, filtro.urgencia, filtro.estado].filter(Boolean).length
        }
        limpiarHref="/panel/solicitudes"
      >
        <PanelFiltersField label="Sector" htmlFor="sector">
          <Input
            id="sector"
            name="sector"
            defaultValue={filtro.sector ?? ""}
            placeholder="Petare, Upata…"
            className="w-48"
          />
        </PanelFiltersField>

        <PanelFiltersField label="Urgencia">
          <FiltroSelect
            name="urgencia"
            ariaLabel="Filtrar por urgencia"
            defaultValue={filtro.urgencia ?? "todas"}
            opciones={[
              { value: "todas", label: "Todas" },
              ...URGENCIAS_SOLICITUD.map((u) => ({
                value: u,
                label: URGENCIA_LABEL[u],
              })),
            ]}
          />
        </PanelFiltersField>

        <PanelFiltersField label="Estado">
          <FiltroSelect
            name="estado"
            ariaLabel="Filtrar por estado"
            defaultValue={filtro.estado ?? "todos"}
            opciones={[
              { value: "todos", label: "Todos" },
              ...ESTADOS_SOLICITUD.map((e) => ({
                value: e,
                label: ESTADO_LABEL[e],
              })),
            ]}
          />
        </PanelFiltersField>
      </PanelFilters>

      <SolicitudesTabla
        solicitudes={solicitudes}
        baseRuta="/panel/solicitudes"
        mostrarSolicitante
      />
    </PanelPage>
  );
}
