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
import { requireRol } from "@/shared/auth";
import { ListFilter, Plus, Truck } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { FiltroSelect } from "@/shared/ui/filtro-select";
import {
  PANEL_HEADER_ACTION,
  PanelFilters,
  PanelFiltersField,
  PanelPage,
  PanelPageHeader,
} from "@/shared/ui/panel";
import { eliminarActividadAction } from "./actions";

type Props = {
  searchParams: Promise<{ estado?: string; tipo?: string }>;
};

export default async function ActividadesPage({ searchParams }: Props) {
  const sesion = await requireRol(Rol.ADMIN);

  const { estado, tipo } = await searchParams;

  const filtro: FiltroActividades = { adminId: sesion.id };
  if (estado && esEstadoActividad(estado)) filtro.estado = estado;
  if (tipo && esTipoActividad(tipo)) filtro.tipo = tipo;

  const actividades = await listarActividadesServicio(filtro);

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

      <PanelFilters
        activos={[filtro.tipo, filtro.estado].filter(Boolean).length}
        limpiarHref="/panel/actividades"
        submitLabel="Filtrar"
        className="gap-3 rounded-xl border-border/70 bg-card/95 p-3 shadow-xs"
      >
        <div className="mr-auto flex min-w-full items-center gap-3 px-1 sm:min-w-56">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary-ink">
            <ListFilter className="size-4" strokeWidth={1.5} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Explorar actividades
            </p>
            <p className="font-mono text-xs text-muted-foreground numeric-tnum">
              {actividades.length} {actividades.length === 1 ? "resultado" : "resultados"}
            </p>
          </div>
        </div>

        <PanelFiltersField label="Tipo">
          <FiltroSelect
            name="tipo"
            ariaLabel="Filtrar por tipo"
            defaultValue={filtro.tipo ?? "todos"}
            className="min-w-40 bg-background"
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
            className="min-w-40 bg-background"
            opciones={[
              { value: "todos", label: "Todos" },
              ...ESTADOS_ACTIVIDAD.map((e) => ({
                value: e,
                label: ESTADO_LABEL[e],
              })),
            ]}
          />
        </PanelFiltersField>
      </PanelFilters>

      <ActividadesTabla
        key={`${filtro.tipo ?? "todos"}:${filtro.estado ?? "todos"}`}
        actividades={actividades}
        eliminarAction={eliminarActividadAction}
      />
    </PanelPage>
  );
}
