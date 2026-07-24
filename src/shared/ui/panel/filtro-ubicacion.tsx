"use client";

import { useMemo, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { PanelFiltersField } from "./panel-filters";

// Filtro de ubicación por catálogo (feature 020) para formularios GET del espacio
// logeado: dos selects dependientes estado → municipio. Radix rinde un <select>
// nativo oculto por cada `name`, así el formulario GET envía `estadoId`/`municipioId`
// sin JS extra; el estado local solo gobierna qué municipios se ofrecen y resetea el
// municipio al cambiar de estado. La opción "todos" usa un sentinela (Radix no
// admite value=""); la página lo trata como "sin filtro".

const TODOS = "_todos";

type OpcionEstado = { id: string; nombre: string };
type OpcionMunicipio = OpcionEstado & { estadoId: string };

type Props = {
  estados: OpcionEstado[];
  municipios: OpcionMunicipio[];
  estadoIdSel?: string;
  municipioIdSel?: string;
  nameEstado?: string;
  nameMunicipio?: string;
};

export function FiltroUbicacion({
  estados,
  municipios,
  estadoIdSel,
  municipioIdSel,
  nameEstado = "estadoId",
  nameMunicipio = "municipioId",
}: Props) {
  const [estadoId, setEstadoId] = useState(estadoIdSel ?? "");
  const [municipioId, setMunicipioId] = useState(municipioIdSel ?? "");
  const anclaRef = useRef<HTMLSpanElement>(null);

  const municipiosDelEstado = useMemo(
    () => (estadoId ? municipios.filter((m) => m.estadoId === estadoId) : []),
    [municipios, estadoId],
  );

  // Auto-submit cuando vive en un form marcado con `data-autosubmit` (sidebar de
  // filtros): al elegir estado o municipio se aplica el filtro sin botón. Diferido
  // para que el <select> oculto de Radix ya esté sincronizado.
  const enviarSiAuto = () => {
    const form = anclaRef.current?.closest("form");
    if (form?.hasAttribute("data-autosubmit")) {
      setTimeout(() => form.requestSubmit(), 0);
    }
  };

  return (
    <span ref={anclaRef} className="contents">
      <PanelFiltersField label="Estado (ubicación)">
        <Select
          name={nameEstado}
          value={estadoId || TODOS}
          onValueChange={(v) => {
            setEstadoId(v === TODOS ? "" : v);
            setMunicipioId("");
            enviarSiAuto();
          }}
        >
          <SelectTrigger
            aria-label="Filtrar por estado geográfico"
            className="w-full bg-background"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos los estados</SelectItem>
            {estados.map((estado) => (
              <SelectItem key={estado.id} value={estado.id}>
                {estado.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PanelFiltersField>

      <PanelFiltersField label="Municipio">
        <Select
          name={nameMunicipio}
          value={municipioId || TODOS}
          onValueChange={(v) => {
            setMunicipioId(v === TODOS ? "" : v);
            enviarSiAuto();
          }}
          disabled={!estadoId}
        >
          <SelectTrigger
            aria-label="Filtrar por municipio"
            className="w-full bg-background"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>
              {estadoId ? "Todos los municipios" : "Elige un estado primero"}
            </SelectItem>
            {municipiosDelEstado.map((municipio) => (
              <SelectItem key={municipio.id} value={municipio.id}>
                {municipio.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PanelFiltersField>
    </span>
  );
}
