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
import { Truck } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { FiltroSelect } from "@/shared/ui/filtro-select";
import { PanelPage, PanelPageHeader } from "@/shared/ui/panel";
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
          <Button asChild>
            <Link href="/panel/actividades/nueva">Nueva actividad</Link>
          </Button>
        }
      />

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 border-t border-border pt-4"
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Tipo</span>
          <FiltroSelect
            name="tipo"
            ariaLabel="Filtrar por tipo"
            defaultValue={filtro.tipo ?? "todos"}
            opciones={[
              { value: "todos", label: "Todos" },
              ...TIPOS_ACTIVIDAD.map((t) => ({
                value: t,
                label: etiquetaTipo(t),
              })),
            ]}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Estado</span>
          <FiltroSelect
            name="estado"
            ariaLabel="Filtrar por estado"
            defaultValue={filtro.estado ?? "todos"}
            opciones={[
              { value: "todos", label: "Todos" },
              ...ESTADOS_ACTIVIDAD.map((e) => ({
                value: e,
                label: ESTADO_LABEL[e],
              })),
            ]}
          />
        </div>

        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <ActividadesTabla actividades={actividades} eliminarAction={eliminarActividadAction} />
    </PanelPage>
  );
}
