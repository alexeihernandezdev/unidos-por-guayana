import Link from "next/link";
import { Search, Truck } from "lucide-react";
import {
  ESTADOS_ACTIVIDAD,
  EstadoActividad,
  esEstadoActividad,
} from "@/modules/actividades/domain/EstadoActividad";
import {
  TIPOS_ACTIVIDAD,
  esTipoActividad,
} from "@/modules/actividades/domain/TipoActividad";
import type { FiltroActividades } from "@/modules/actividades/domain/ActividadRepository";
import { ActividadesColaboradorGrid } from "@/modules/actividades/ui/ActividadesColaboradorGrid";
import { ESTADO_LABEL } from "@/modules/actividades/ui/estados";
import { etiquetaTipo } from "@/modules/actividades/ui/tipos";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarActividadesServicio } from "@/shared/actividades";
import { cargarCatalogoUbicacion } from "@/shared/ubicacion";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import { FiltroSelect } from "@/shared/ui/filtro-select";
import { Input } from "@/shared/ui/input";
import {
  FiltroUbicacion,
  PanelEmptyState,
  PanelFilterShell,
  PanelFiltersField,
  PanelPage,
  PanelPageHeader,
} from "@/shared/ui/panel";

type Props = {
  searchParams: Promise<{
    buscar?: string;
    estado?: string;
    tipo?: string;
    estadoId?: string;
    municipioId?: string;
  }>;
};

// Catálogo de actividades de la red para el colaborador autenticado. La vista
// abre en `RECOLECTANDO`, pero permite explorar el resto del ciclo de vida sin
// confundir las actividades cerradas con las que todavía aceptan aportes.
export default async function ActividadesPublicasPage({ searchParams }: Props) {
  await requireRol(Rol.COLABORADOR, Rol.ADMIN);

  const params = await searchParams;
  const catalogo = await cargarCatalogoUbicacion();
  const estadoIds = new Set(catalogo.estados.map((e) => e.id));
  const municipioIds = new Set(catalogo.municipios.map((m) => m.id));

  const textoBuscado = params.buscar?.trim().slice(0, 80) || undefined;
  const estadoSeleccionado =
    params.estado === "todos"
      ? undefined
      : params.estado && esEstadoActividad(params.estado)
        ? params.estado
        : EstadoActividad.RECOLECTANDO;
  const tipoSeleccionado =
    params.tipo && esTipoActividad(params.tipo) ? params.tipo : undefined;
  const estadoIdSel =
    params.estadoId && estadoIds.has(params.estadoId)
      ? params.estadoId
      : undefined;
  const municipioIdSel =
    params.municipioId && municipioIds.has(params.municipioId)
      ? params.municipioId
      : undefined;

  const filtro: FiltroActividades = {};
  if (textoBuscado) filtro.texto = textoBuscado;
  if (estadoSeleccionado) filtro.estado = estadoSeleccionado;
  if (tipoSeleccionado) filtro.tipo = tipoSeleccionado;
  if (estadoIdSel) filtro.estadoId = estadoIdSel;
  if (municipioIdSel) filtro.municipioId = municipioIdSel;

  const actividades = await listarActividadesServicio(filtro);
  const filtrosPersonalizados =
    (params.estado !== undefined &&
    estadoSeleccionado !== EstadoActividad.RECOLECTANDO
      ? 1
      : 0) + (tipoSeleccionado ? 1 : 0);
  const cantidadFiltros =
    filtrosPersonalizados +
    (textoBuscado ? 1 : 0) +
    (estadoIdSel ? 1 : 0) +
    (municipioIdSel ? 1 : 0);

  return (
    <PanelPage>
      <PanelPageHeader
        animated
        icon={Truck}
        eyebrow="Colabora"
        title="Actividades de la red"
        description="Explora las iniciativas activas y descubre dónde tu aporte puede hacer la diferencia."
        actions={
          <Button asChild variant="outline">
            <Link href="/mis-aportes">Ver mis aportes</Link>
          </Button>
        }
      />

      <PanelFilterShell
        titulo="Explorar actividades"
        activos={cantidadFiltros}
        limpiarHref="/actividades"
        submitLabel="Aplicar filtros"
        resumen={`${actividades.length} ${actividades.length === 1 ? "resultado" : "resultados"}`}
        filtros={
          <>
            <PanelFiltersField label="Buscar" htmlFor="buscar-actividad">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <Input
                  id="buscar-actividad"
                  name="buscar"
                  type="search"
                  defaultValue={textoBuscado ?? ""}
                  maxLength={80}
                  placeholder="Título, descripción o destino"
                  className="h-10 w-full bg-background pl-9"
                />
              </div>
            </PanelFiltersField>

            <PanelFiltersField label="Estado">
              <FiltroSelect
                name="estado"
                ariaLabel="Filtrar actividades por estado"
                defaultValue={estadoSeleccionado ?? "todos"}
                className="w-full bg-background"
                opciones={[
                  { value: "todos", label: "Todos los estados" },
                  ...ESTADOS_ACTIVIDAD.map((estado) => ({
                    value: estado,
                    label: ESTADO_LABEL[estado],
                  })),
                ]}
              />
            </PanelFiltersField>

            <PanelFiltersField label="Tipo">
              <FiltroSelect
                name="tipo"
                ariaLabel="Filtrar actividades por tipo"
                defaultValue={tipoSeleccionado ?? "todos"}
                className="w-full bg-background"
                opciones={[
                  { value: "todos", label: "Todos los tipos" },
                  ...TIPOS_ACTIVIDAD.map((tipo) => ({
                    value: tipo,
                    label: etiquetaTipo(tipo),
                  })),
                ]}
              />
            </PanelFiltersField>

            <FiltroUbicacion
              estados={catalogo.estados}
              municipios={catalogo.municipios}
              estadoIdSel={estadoIdSel}
              municipioIdSel={municipioIdSel}
            />
          </>
        }
      >
        {actividades.length === 0 ? (
          <PanelEmptyState
            bordered={false}
            icon={Truck}
            title="No encontramos actividades"
            description="No hay resultados con esta combinación de filtros. Prueba con otra ubicación o tipo, o vuelve a las actividades que están recolectando."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/actividades">Ver actividades recolectando</Link>
              </Button>
            }
          />
        ) : (
          <ActividadesColaboradorGrid
            key={`${textoBuscado ?? "sin-busqueda"}:${estadoSeleccionado ?? "todos"}:${tipoSeleccionado ?? "todos"}:${estadoIdSel ?? ""}:${municipioIdSel ?? ""}`}
            actividades={actividades}
          />
        )}
      </PanelFilterShell>
    </PanelPage>
  );
}
