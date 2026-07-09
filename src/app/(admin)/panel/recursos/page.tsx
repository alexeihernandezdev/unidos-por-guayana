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
import { activarRecursoAction, archivarRecursoAction } from "./actions";

type Props = {
  searchParams: Promise<{ categoria?: string; estado?: string }>;
};

const campo =
  "rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

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
        <Button asChild>
          <Link href="/panel/recursos/nuevo">Nuevo recurso</Link>
        </Button>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 border-t border-border pt-4"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoria" className="text-sm font-medium">
            Categoría
          </label>
          <select
            id="categoria"
            name="categoria"
            defaultValue={filtro.categoria ?? ""}
            className={campo}
          >
            <option value="">Todas</option>
            {CATEGORIAS_RECURSO.map((c) => (
              <option key={c} value={c}>
                {CATEGORIA_LABEL[c]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="estado" className="text-sm font-medium">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            defaultValue={estado === "activos" ? "activos" : ""}
            className={campo}
          >
            <option value="">Todos</option>
            <option value="activos">Solo activos</option>
          </select>
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
