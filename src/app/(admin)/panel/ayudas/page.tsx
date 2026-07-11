import Link from "next/link";
import {
  ESTADOS_AYUDA,
  esEstadoAyuda,
} from "@/modules/ayudas/domain/EstadoAyuda";
import {
  TIPOS_ACTIVIDAD,
  esTipoActividad,
} from "@/modules/ayudas/domain/TipoActividad";
import type { FiltroAyudas } from "@/modules/ayudas/domain/AyudaRepository";
import { AyudasTabla } from "@/modules/ayudas/ui/AyudasTabla";
import { ESTADO_LABEL } from "@/modules/ayudas/ui/estados";
import { etiquetaTipo } from "@/modules/ayudas/ui/tipos";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarAyudasServicio } from "@/shared/ayudas";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import { FiltroSelect } from "@/shared/ui/filtro-select";
import { eliminarAyudaAction } from "./actions";

type Props = {
  searchParams: Promise<{ estado?: string; tipo?: string }>;
};

export default async function AyudasPage({ searchParams }: Props) {
  const sesion = await requireRol(Rol.ADMIN);

  const { estado, tipo } = await searchParams;

  const filtro: FiltroAyudas = { adminId: sesion.id };
  if (estado && esEstadoAyuda(estado)) filtro.estado = estado;
  if (tipo && esTipoActividad(tipo)) filtro.tipo = tipo;

  const ayudas = await listarAyudasServicio(filtro);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Actividades de ayuda
          </h1>
          <p className="text-sm text-muted-foreground">
            Planifica y sigue cada actividad: envíos, jornadas y eventos sociales.
          </p>
        </div>
        <Button asChild>
          <Link href="/panel/ayudas/nueva">Nueva actividad</Link>
        </Button>
      </div>

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
              ...ESTADOS_AYUDA.map((e) => ({
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

      <AyudasTabla ayudas={ayudas} eliminarAction={eliminarAyudaAction} />
    </main>
  );
}
