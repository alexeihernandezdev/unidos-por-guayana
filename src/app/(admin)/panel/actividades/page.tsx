import Link from "next/link";
import {
  ESTADOS_ACTIVIDAD,
  esEstadoActividad,
} from "@/modules/actividades/domain/EstadoActividad";
import {
  TIPOS_ACTIVIDAD,
  esTipoActividad,
} from "@/modules/actividades/domain/TipoActividad";
import type { FiltroActividades } from "@/modules/actividades/domain/ActividadRepository";
import { ActividadesTabla } from "@/modules/actividades/ui/ActividadesTabla";
import { ESTADO_LABEL } from "@/modules/actividades/ui/estados";
import { etiquetaTipo } from "@/modules/actividades/ui/tipos";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarActividadesServicio } from "@/shared/actividades";
import { cargarCatalogoUbicacion } from "@/shared/ubicacion";
import { requireRol } from "@/shared/auth";
import { Plus, Truck } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { FiltroSelect } from "@/shared/ui/filtro-select";
import {
  FiltroUbicacion,
  PANEL_HEADER_ACTION,
  PanelFilterShell,
  PanelFiltersField,
  PanelPage,
  PanelPageHeader,
} from "@/shared/ui/panel";
import { eliminarActividadAction } from "./actions";

type Props = {
  searchParams: Promise<{
    estado?: string;
    tipo?: string;
    estadoId?: string;
    municipioId?: string;
  }>;
};

export default async function ActividadesPage({ searchParams }: Props) {
  const sesion = await requireRol(Rol.ADMIN);

  const params = await searchParams;
  const catalogo = await cargarCatalogoUbicacion();
  const estadoIds = new Set(catalogo.estados.map((e) => e.id));
  const municipioIds = new Set(catalogo.municipios.map((m) => m.id));

  const filtro: FiltroActividades = { adminId: sesion.id };
  if (params.estado && esEstadoActividad(params.estado))
    filtro.estado = params.estado;
  if (params.tipo && esTipoActividad(params.tipo)) filtro.tipo = params.tipo;
  if (params.estadoId && estadoIds.has(params.estadoId))
    filtro.estadoId = params.estadoId;
  if (params.municipioId && municipioIds.has(params.municipioId))
    filtro.municipioId = params.municipioId;

  const actividades = await listarActividadesServicio(filtro);

  const activos = [
    filtro.tipo,
    filtro.estado,
    filtro.estadoId,
    filtro.municipioId,
  ].filter(Boolean).length;

  return (
    <PanelPage>
      <PanelPageHeader
        icon={Truck}
        eyebrow="Operación"
        title="Actividades de ayuda"
        description="Planifica y sigue cada actividad: envíos, jornadas y eventos sociales."
        actions={
          <Button asChild className={PANEL_HEADER_ACTION.primary}>
            <Link href="/panel/actividades/nueva">
              <Plus strokeWidth={1.5} />
              Nueva actividad
            </Link>
          </Button>
        }
      />

      <PanelFilterShell
        titulo="Explorar actividades"
        activos={activos}
        limpiarHref="/panel/actividades"
        submitLabel="Filtrar"
        resumen={`${actividades.length} ${actividades.length === 1 ? "resultado" : "resultados"}`}
        filtros={
          <>
            <PanelFiltersField label="Tipo">
              <FiltroSelect
                name="tipo"
                ariaLabel="Filtrar por tipo"
                defaultValue={filtro.tipo ?? "todos"}
                className="w-full bg-background"
                opciones={[
                  { value: "todos", label: "Todos" },
                  ...TIPOS_ACTIVIDAD.map((t) => ({
                    value: t,
                    label: etiquetaTipo(t),
                  })),
                ]}
              />
            </PanelFiltersField>

            <PanelFiltersField label="Estado">
              <FiltroSelect
                name="estado"
                ariaLabel="Filtrar por estado"
                defaultValue={filtro.estado ?? "todos"}
                className="w-full bg-background"
                opciones={[
                  { value: "todos", label: "Todos" },
                  ...ESTADOS_ACTIVIDAD.map((e) => ({
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
        <ActividadesTabla
          key={`${filtro.tipo ?? "todos"}:${filtro.estado ?? "todos"}:${filtro.estadoId ?? ""}:${filtro.municipioId ?? ""}`}
          actividades={actividades}
          eliminarAction={eliminarActividadAction}
        />
      </PanelFilterShell>
    </PanelPage>
  );
}
