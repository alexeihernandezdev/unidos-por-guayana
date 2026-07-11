import Link from "next/link";
import {
  CATEGORIAS_RECURSO,
  esCategoriaRecurso,
} from "@/modules/recursos/domain/CategoriaRecurso";
import type { FiltroRecursos } from "@/modules/recursos/domain/RecursoRepository";
import { CATEGORIA_LABEL } from "@/modules/recursos/ui/categorias";
import { RecursosTabla } from "@/modules/recursos/ui/RecursosTabla";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarRecursosServicio } from "@/shared/recursos";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import { FiltroSelect } from "@/shared/ui/filtro-select";
import { activarRecursoAction, archivarRecursoAction } from "./actions";

type Props = {
  searchParams: Promise<{ categoria?: string; estado?: string }>;
};

export default async function RecursosPage({ searchParams }: Props) {
  await requireRol(Rol.ADMIN);

  const { categoria, estado } = await searchParams;

  const filtro: FiltroRecursos = {};
  if (categoria && esCategoriaRecurso(categoria)) filtro.categoria = categoria;
  if (estado === "activos") filtro.soloActivos = true;

  const recursos = await listarRecursosServicio(filtro);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Catálogo de recursos
          </h1>
          <p className="text-sm text-muted-foreground">
            Lista maestra de lo que se puede aportar o necesitar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/panel/recursos/propuestas">Ver propuestas</Link>
          </Button>
          <Button asChild>
            <Link href="/panel/recursos/nuevo">Nuevo recurso</Link>
          </Button>
        </div>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 border-t border-border pt-4"
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Categoría</span>
          <FiltroSelect
            name="categoria"
            ariaLabel="Filtrar por categoría"
            defaultValue={filtro.categoria ?? "todas"}
            opciones={[
              { value: "todas", label: "Todas" },
              ...CATEGORIAS_RECURSO.map((c) => ({
                value: c,
                label: CATEGORIA_LABEL[c],
              })),
            ]}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Estado</span>
          <FiltroSelect
            name="estado"
            ariaLabel="Filtrar por estado"
            defaultValue={estado === "activos" ? "activos" : "todos"}
            opciones={[
              { value: "todos", label: "Todos" },
              { value: "activos", label: "Solo activos" },
            ]}
          />
        </div>

        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <RecursosTabla
        recursos={recursos}
        archivarAction={archivarRecursoAction}
        activarAction={activarRecursoAction}
      />
    </main>
  );
}
