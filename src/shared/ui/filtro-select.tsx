"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

// Select de filtro para formularios GET de páginas server (recursos, actividades,
// solicitudes…). Envuelve el Select de shadcn/Radix: con `name`, Radix rinde un
// <select> nativo oculto que participa en el submit del formulario, así la
// página server sigue leyendo searchParams sin JS adicional.
//
// Radix no admite items con value="" — la opción "Todos" usa un valor sentinela
// (p. ej. "todas") que la página trata como "sin filtro" al validarlo.

export type OpcionFiltro = {
  value: string;
  label: string;
};

type Props = {
  name: string;
  opciones: OpcionFiltro[];
  defaultValue: string;
  ariaLabel?: string;
  className?: string;
};

export function FiltroSelect({
  name,
  opciones,
  defaultValue,
  ariaLabel,
  className,
}: Props) {
  return (
    <Select name={name} defaultValue={defaultValue}>
      <SelectTrigger aria-label={ariaLabel} className={className ?? "min-w-40"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opciones.map((opcion) => (
          <SelectItem key={opcion.value} value={opcion.value}>
            {opcion.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
