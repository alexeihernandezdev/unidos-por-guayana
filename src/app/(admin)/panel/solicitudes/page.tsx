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
import { SolicitudesAdminGrid } from "@/modules/solicitudes/ui/SolicitudesAdminGrid";
import { ESTADO_LABEL } from "@/modules/solicitudes/ui/estados";
import { URGENCIA_LABEL } from "@/modules/solicitudes/ui/urgencias";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  cargarPortadasServicio,
  listarSolicitudesServicio,
} from "@/shared/solicitudes";
import { cargarCatalogoUbicacion } from "@/shared/ubicacion";
import { requireRol } from "@/shared/auth";
import { FiltroSelect } from "@/shared/ui/filtro-select";
import { Input } from "@/shared/ui/input";
import {
  FiltroUbicacion,
  PanelFilterShell,
  PanelFiltersField,
  PanelPage,
  PanelPageHeader,
} from "@/shared/ui/panel";
import { cerrarSolicitudAction, marcarAtendidaAction } from "./actions";

type Props = {
  searchParams: Promise<{
    sector?: string;
    urgencia?: string;
    estado?: string;
    estadoId?: string;
    municipioId?: string;
  }>;
};

export default async function SolicitudesAdminPage({ searchParams }: Props) {
  await requireRol(Rol.ADMIN);

  const params = await searchParams;
  const catalogo = await cargarCatalogoUbicacion();
  const estadoIds = new Set(catalogo.estados.map((e) => e.id));
  const municipioIds = new Set(catalogo.municipios.map((m) => m.id));

  const filtro: FiltroSolicitudes = {};
  if (params.sector?.trim()) filtro.sector = params.sector.trim();
  if (params.urgencia && esUrgenciaSolicitud(params.urgencia))
    filtro.urgencia = params.urgencia;
  if (params.estado && esEstadoSolicitud(params.estado))
    filtro.estado = params.estado;
  if (params.estadoId && estadoIds.has(params.estadoId))
    filtro.estadoId = params.estadoId;
  if (params.municipioId && municipioIds.has(params.municipioId))
    filtro.municipioId = params.municipioId;

  const solicitudes = await listarSolicitudesServicio(filtro);
  const portadas = await cargarPortadasServicio(solicitudes);

  const activos = [
    filtro.sector,
    filtro.urgencia,
    filtro.estado,
    filtro.estadoId,
    filtro.municipioId,
  ].filter(Boolean).length;

  return (
    <PanelPage>
      <PanelPageHeader
        icon={Inbox}
        eyebrow="Operación"
        title="Solicitudes de ayuda"
        description="Peticiones del terreno: sector, urgencia y recursos necesarios."
      />

      <PanelFilterShell
        activos={activos}
        limpiarHref="/panel/solicitudes"
        submitLabel="Aplicar filtros"
        resumen={`${solicitudes.length} ${solicitudes.length === 1 ? "resultado" : "resultados"}`}
        filtros={
          <>
            <PanelFiltersField label="Sector" htmlFor="sector">
              <Input
                id="sector"
                name="sector"
                defaultValue={filtro.sector ?? ""}
                placeholder="Petare, Upata…"
                className="w-full bg-background"
              />
            </PanelFiltersField>

            <PanelFiltersField label="Urgencia">
              <FiltroSelect
                name="urgencia"
                ariaLabel="Filtrar por urgencia"
                defaultValue={filtro.urgencia ?? "todas"}
                className="w-full bg-background"
                opciones={[
                  { value: "todas", label: "Todas" },
                  ...URGENCIAS_SOLICITUD.map((u) => ({
                    value: u,
                    label: URGENCIA_LABEL[u],
                  })),
                ]}
              />
            </PanelFiltersField>

            <PanelFiltersField label="Situación">
              <FiltroSelect
                name="estado"
                ariaLabel="Filtrar por situación de la solicitud"
                defaultValue={filtro.estado ?? "todos"}
                className="w-full bg-background"
                opciones={[
                  { value: "todos", label: "Todas" },
                  ...ESTADOS_SOLICITUD.map((e) => ({
                    value: e,
                    label: ESTADO_LABEL[e],
                  })),
                ]}
              />
            </PanelFiltersField>

            <FiltroUbicacion
              estados={catalogo.estados}
              municipios={catalogo.municipios}
              estadoIdSel={filtro.estadoId}
              municipioIdSel={filtro.municipioId}
            />
          </>
        }
      >
        <SolicitudesAdminGrid
          solicitudes={solicitudes}
          baseRuta="/panel/solicitudes"
          portadas={portadas}
          marcarAtendidaAction={marcarAtendidaAction}
          cerrarAction={cerrarSolicitudAction}
        />
      </PanelFilterShell>
    </PanelPage>
  );
}
