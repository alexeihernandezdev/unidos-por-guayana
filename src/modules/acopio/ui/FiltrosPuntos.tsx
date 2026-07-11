"use client";

import { Search, X } from "lucide-react";
import { useMemo } from "react";
import type { Estado } from "@/modules/ubicacion/domain/Estado";
import type { Municipio } from "@/modules/ubicacion/domain/Municipio";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { PuntoAcopioConUbicacion } from "./PuntoAcopioCard";

// Filtros del listado de puntos de acopio (feature 011). Client-side: los
// puntos ya llegaron con el server component, así que filtrar es instantáneo.
// Búsqueda por texto (nombre, referencia, municipio), ubicación dependiente
// estado→municipio y, en la gestión del admin, el eje activo/archivado.

export type FiltroEstadoActivo = "todos" | "activos" | "archivados";

export type FiltroPuntosValor = {
  texto: string;
  estadoId: string;
  municipioId: string;
  activo: FiltroEstadoActivo;
};

export const FILTRO_INICIAL: FiltroPuntosValor = {
  texto: "",
  estadoId: "",
  municipioId: "",
  activo: "todos",
};

/** Aplica los filtros en memoria. Compartido por gestión y directorio. */
export function filtrarPuntos(
  puntos: PuntoAcopioConUbicacion[],
  filtro: FiltroPuntosValor,
): PuntoAcopioConUbicacion[] {
  const texto = filtro.texto.trim().toLowerCase();
  return puntos.filter((p) => {
    if (filtro.activo === "activos" && !p.activo) return false;
    if (filtro.activo === "archivados" && p.activo) return false;
    if (filtro.estadoId && p.estadoId !== filtro.estadoId) return false;
    if (filtro.municipioId && p.municipioId !== filtro.municipioId) return false;
    if (
      texto &&
      ![p.nombre, p.referencia, p.municipioNombre, p.estadoNombre]
        .join(" ")
        .toLowerCase()
        .includes(texto)
    ) {
      return false;
    }
    return true;
  });
}

const OPCIONES_ACTIVO: { valor: FiltroEstadoActivo; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "activos", label: "Activos" },
  { valor: "archivados", label: "Archivados" },
];

// Radix no admite items con value="": sentinela para la opción "Todos".
const TODOS = "_todos";

type Props = {
  valor: FiltroPuntosValor;
  onCambio: (valor: FiltroPuntosValor) => void;
  estados: Estado[];
  municipios: Municipio[];
  /** Muestra el eje activo/archivado (solo gestión del admin). */
  conEstadoActivo?: boolean;
};

export function FiltrosPuntos({
  valor,
  onCambio,
  estados,
  municipios,
  conEstadoActivo = false,
}: Props) {
  const municipiosDelEstado = useMemo(
    () =>
      valor.estadoId
        ? municipios.filter((m) => m.estadoId === valor.estadoId)
        : [],
    [municipios, valor.estadoId],
  );

  const hayFiltros =
    valor.texto.trim() !== "" ||
    valor.estadoId !== "" ||
    valor.municipioId !== "" ||
    valor.activo !== "todos";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search
            strokeWidth={1.5}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={valor.texto}
            onChange={(e) => onCambio({ ...valor, texto: e.target.value })}
            placeholder="Buscar por nombre, referencia o municipio…"
            aria-label="Buscar puntos de acopio"
            className="pl-9"
          />
        </div>

        <Select
          value={valor.estadoId || TODOS}
          onValueChange={(v) =>
            onCambio({
              ...valor,
              estadoId: v === TODOS ? "" : v,
              municipioId: "",
            })
          }
        >
          <SelectTrigger aria-label="Filtrar por estado" className="min-w-44">
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

        <Select
          value={valor.municipioId || TODOS}
          onValueChange={(v) =>
            onCambio({ ...valor, municipioId: v === TODOS ? "" : v })
          }
          disabled={!valor.estadoId}
        >
          <SelectTrigger
            aria-label="Filtrar por municipio"
            className="min-w-44"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>
              {valor.estadoId ? "Todos los municipios" : "Municipio"}
            </SelectItem>
            {municipiosDelEstado.map((municipio) => (
              <SelectItem key={municipio.id} value={municipio.id}>
                {municipio.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {conEstadoActivo && (
          <div
            role="group"
            aria-label="Filtrar por estado del punto"
            className="inline-flex rounded-md border bg-muted p-0.5"
          >
            {OPCIONES_ACTIVO.map((opcion) => (
              <button
                key={opcion.valor}
                type="button"
                onClick={() => onCambio({ ...valor, activo: opcion.valor })}
                aria-pressed={valor.activo === opcion.valor}
                className={`rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-sm transition-colors ${
                  valor.activo === opcion.valor
                    ? "bg-background font-medium shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opcion.label}
              </button>
            ))}
          </div>
        )}

        {hayFiltros && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCambio(FILTRO_INICIAL)}
          >
            <X strokeWidth={1.5} aria-hidden="true" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
