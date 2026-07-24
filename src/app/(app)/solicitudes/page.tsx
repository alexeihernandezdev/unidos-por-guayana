import Link from "next/link";
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
import { SolicitudesGrid } from "@/modules/solicitudes/ui/SolicitudesGrid";
import { ESTADO_LABEL } from "@/modules/solicitudes/ui/estados";
import { URGENCIA_LABEL } from "@/modules/solicitudes/ui/urgencias";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  cargarPortadasServicio,
  listarSolicitudesServicio,
} from "@/shared/solicitudes";
import { cargarCatalogoUbicacion } from "@/shared/ubicacion";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import { FiltroSelect } from "@/shared/ui/filtro-select";
import {
  FiltroUbicacion,
  PanelFilterShell,
  PanelFiltersField,
  PanelPage,
  PanelPageHeader,
} from "@/shared/ui/panel";

type Props = {
  searchParams: Promise<{
    urgencia?: string;
    estado?: string;
    estadoId?: string;
    municipioId?: string;
  }>;
};

export default async function MisSolicitudesPage({ searchParams }: Props) {
  const usuario = await requireRol(Rol.SOLICITANTE);

  const params = await searchParams;
  const catalogo = await cargarCatalogoUbicacion();
  const estadoIds = new Set(catalogo.estados.map((e) => e.id));
  const municipioIds = new Set(catalogo.municipios.map((m) => m.id));

  const filtro: FiltroSolicitudes = { solicitanteId: usuario.id };
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
    filtro.urgencia,
    filtro.estado,
    filtro.estadoId,
    filtro.municipioId,
  ].filter(Boolean).length;

  return (
    <PanelPage>
      <PanelPageHeader
        animated
        icon={Inbox}
        eyebrow="Mis peticiones"
        title="Mis solicitudes"
        description="Peticiones de ayuda que has registrado para tu sector."
        actions={
          <Button asChild>
            <Link href="/solicitudes/nueva">Nueva solicitud</Link>
          </Button>
        }
      />

      <PanelFilterShell
        activos={activos}
        limpiarHref="/solicitudes"
        submitLabel="Aplicar filtros"
        resumen={`${solicitudes.length} ${solicitudes.length === 1 ? "solicitud" : "solicitudes"}`}
        filtros={
          <>
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
        <SolicitudesGrid
          solicitudes={solicitudes}
          baseRuta="/solicitudes"
          portadas={portadas}
        />
      </PanelFilterShell>
    </PanelPage>
  );
}
