"use client";

import { useRef } from "react";
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
  const anclaRef = useRef<HTMLSpanElement>(null);

  // Auto-submit: si el select vive en un form marcado con `data-autosubmit`
  // (p. ej. el sidebar de filtros), al elegir una opción se aplica el filtro sin
  // botón. Se difiere con setTimeout para que Radix ya haya sincronizado el
  // <select> oculto antes de serializar el form. En forms sin ese atributo, no
  // hace nada (comportamiento previo intacto).
  const alCambiar = () => {
    const form = anclaRef.current?.closest("form");
    if (form?.hasAttribute("data-autosubmit")) {
      setTimeout(() => form.requestSubmit(), 0);
    }
  };

  return (
    <span ref={anclaRef} className="contents">
      <Select name={name} defaultValue={defaultValue} onValueChange={alCambiar}>
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
    </span>
  );
}
