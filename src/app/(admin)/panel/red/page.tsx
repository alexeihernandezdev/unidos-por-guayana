import {
  CATEGORIAS_RECURSO,
  esCategoriaRecurso,
  type CategoriaRecurso,
} from "@/modules/recursos/domain/CategoriaRecurso";
import { CATEGORIA_LABEL_CORTA } from "@/modules/afiliaciones/ui/categorias";
import { RedTabla } from "@/modules/afiliaciones/ui/RedTabla";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarMiRedServicio } from "@/shared/afiliaciones";
import { Users } from "lucide-react";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import { FiltroSelect } from "@/shared/ui/filtro-select";
import { PanelPage, PanelPageHeader } from "@/shared/ui/panel";
import { removerDeRedAction } from "./actions";

type Props = {
  searchParams: Promise<{ categoria?: string }>;
};

export default async function RedPage({ searchParams }: Props) {
  const sesion = await requireRol(Rol.ADMIN);
  const { categoria } = await searchParams;
  const filtro: CategoriaRecurso | undefined =
    categoria && esCategoriaRecurso(categoria) ? categoria : undefined;

  const miembros = await listarMiRedServicio(sesion.id, filtro);

  return (
    <PanelPage>
      <PanelPageHeader
        icon={Users}
        eyebrow="Red operativa"
        title="Mi red"
        description="Colaboradores afiliados a tu centro de acopio. Úsalo para saber a quién convocar según lo que puede aportar cada uno."
      />

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 border-t border-border pt-4"
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Categoría</span>
          <FiltroSelect
            name="categoria"
            ariaLabel="Filtrar por categoría"
            defaultValue={filtro ?? "todas"}
            opciones={[
              { value: "todas", label: "Todas" },
              ...CATEGORIAS_RECURSO.map((c) => ({
                value: c,
                label: CATEGORIA_LABEL_CORTA[c],
              })),
            ]}
          />
        </div>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <RedTabla miembros={miembros} removerAction={removerDeRedAction} />
    </PanelPage>
  );
}
