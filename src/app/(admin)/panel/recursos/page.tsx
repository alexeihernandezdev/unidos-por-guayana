import {
  CATEGORIAS_RECURSO,
  esCategoriaRecurso,
} from "@/modules/recursos/domain/CategoriaRecurso";
import type { FiltroRecursos } from "@/modules/recursos/domain/RecursoRepository";
import { CATEGORIA_LABEL } from "@/modules/recursos/ui/categorias";
import { RecursosGestion } from "@/modules/recursos/ui/RecursosGestion";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarRecursosServicio } from "@/shared/recursos";
import { requireRol } from "@/shared/auth";
import { FiltroSelect } from "@/shared/ui/filtro-select";
import {
  PanelFilters,
  PanelFiltersField,
  PanelPage,
} from "@/shared/ui/panel";
import {
  activarRecursoAction,
  archivarRecursoAction,
  crearRecursoAction,
  editarRecursoAction,
} from "./actions";

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

  const filtros = (
    <PanelFilters
      activos={
        [filtro.categoria, filtro.soloActivos].filter(Boolean).length
      }
      limpiarHref="/panel/recursos"
    >
      <PanelFiltersField label="Categoría">
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
      </PanelFiltersField>

      <PanelFiltersField label="Estado">
        <FiltroSelect
          name="estado"
          ariaLabel="Filtrar por estado"
          defaultValue={estado === "activos" ? "activos" : "todos"}
          opciones={[
            { value: "todos", label: "Todos" },
            { value: "activos", label: "Solo activos" },
          ]}
        />
      </PanelFiltersField>
    </PanelFilters>
  );

  return (
    <PanelPage>
      <RecursosGestion
        recursos={recursos}
        filtros={filtros}
        crearAction={crearRecursoAction}
        editarAction={editarRecursoAction}
        archivarAction={archivarRecursoAction}
        activarAction={activarRecursoAction}
      />
    </PanelPage>
  );
}
