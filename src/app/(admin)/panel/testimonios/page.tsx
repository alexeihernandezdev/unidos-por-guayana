import { Search } from "lucide-react";
import {
  ESTADOS_TESTIMONIO,
  esEstadoTestimonio,
} from "@/modules/testimonios/domain";
import { ModeracionTestimonios, ESTADO_TESTIMONIO_LABEL } from "@/modules/testimonios/ui";
import { requireAdminVerificado } from "@/shared/auth";
import { listarTestimoniosParaModerarServicio } from "@/shared/testimonios";
import { FiltroSelect } from "@/shared/ui/filtro-select";
import { Input } from "@/shared/ui/input";
import { PanelFilters, PanelFiltersField, PanelPage } from "@/shared/ui/panel";
import {
  aprobarTestimonioAction,
  destacarTestimonioAction,
  ocultarTestimonioAction,
  quitarDestacadoTestimonioAction,
  rechazarTestimonioAction,
} from "./actions";

type Props = {
  searchParams: Promise<{ estado?: string; buscar?: string }>;
};

export default async function TestimoniosAdminPage({ searchParams }: Props) {
  await requireAdminVerificado();
  const params = await searchParams;
  const estado =
    params.estado && esEstadoTestimonio(params.estado)
      ? params.estado
      : undefined;
  const texto = params.buscar?.trim().slice(0, 80) || undefined;
  const testimonios = await listarTestimoniosParaModerarServicio({ estado, texto });

  const filtros = (
    <PanelFilters
      activos={(estado ? 1 : 0) + (texto ? 1 : 0)}
      limpiarHref="/panel/testimonios"
      submitLabel="Aplicar filtros"
    >
      <PanelFiltersField label="Buscar" htmlFor="buscar-testimonio" className="min-w-full flex-1 sm:min-w-64">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
          <Input
            id="buscar-testimonio"
            name="buscar"
            type="search"
            defaultValue={texto ?? ""}
            maxLength={80}
            placeholder="Título, relato o autor"
            className="pl-9"
          />
        </div>
      </PanelFiltersField>
      <PanelFiltersField label="Estado">
        <FiltroSelect
          name="estado"
          ariaLabel="Filtrar testimonios por estado"
          defaultValue={estado ?? "todos"}
          opciones={[
            { value: "todos", label: "Todos los estados" },
            ...ESTADOS_TESTIMONIO.map((valor) => ({
              value: valor,
              label: ESTADO_TESTIMONIO_LABEL[valor],
            })),
          ]}
        />
      </PanelFiltersField>
    </PanelFilters>
  );

  return (
    <PanelPage>
      <ModeracionTestimonios
        testimonios={testimonios}
        filtros={filtros}
        aprobarAction={aprobarTestimonioAction}
        rechazarAction={rechazarTestimonioAction}
        ocultarAction={ocultarTestimonioAction}
        destacarAction={destacarTestimonioAction}
        quitarDestacadoAction={quitarDestacadoTestimonioAction}
      />
    </PanelPage>
  );
}
