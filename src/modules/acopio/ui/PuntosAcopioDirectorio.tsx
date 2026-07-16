"use client";

import { Grid2X2, ListFilter, Map, MapPinned, X } from "lucide-react";
import { useState } from "react";
import type { Estado } from "@/modules/ubicacion/domain/Estado";
import type { Municipio } from "@/modules/ubicacion/domain/Municipio";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  FILTRO_INICIAL,
  FiltrosPuntos,
  filtrarPuntos,
  type FiltroPuntosValor,
} from "./FiltrosPuntos";
import type { PuntoAcopioConUbicacion } from "./PuntoAcopioCard";
import { PuntoAcopioResultado } from "./PuntoAcopioResultado";
import { PuntosAcopioMapaDirectorioLazy } from "./PuntosAcopioMapaDirectorioLazy";

// Directorio de puntos de acopio para el colaborador (feature 011): responde
// "¿a dónde llevo lo que aporto?". Grid de cards con búsqueda y filtro por
// ubicación; cada card lleva CTAs a Maps/WhatsApp y su vista de detalle.

type Props = {
  puntos: PuntoAcopioConUbicacion[];
  estados: Estado[];
  municipios: Municipio[];
  vistaInicial?: VistaDirectorio;
};

type VistaDirectorio = "directorio" | "mapa";

export function PuntosAcopioDirectorio({
  puntos,
  estados,
  municipios,
  vistaInicial = "directorio",
}: Props) {
  const [filtro, setFiltro] = useState<FiltroPuntosValor>(FILTRO_INICIAL);
  const [vista, setVista] = useState<VistaDirectorio>(vistaInicial);
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);

  const visibles = filtrarPuntos(puntos, filtro);

  function cambiarVista(nuevaVista: VistaDirectorio) {
    setVista(nuevaVista);
    const url = new URL(window.location.href);
    if (nuevaVista === "mapa") url.searchParams.set("vista", "mapa");
    else url.searchParams.delete("vista");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }

  function seleccionarPunto(id: string) {
    setSeleccionadoId(id);
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-acopio-id="${CSS.escape(id)}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  if (puntos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 border-t border-border py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-lg bg-muted">
          <MapPinned
            strokeWidth={1.5}
            className="size-6 text-muted-foreground"
            aria-hidden="true"
          />
        </span>
        <p className="max-w-[42ch] text-sm text-muted-foreground">
          Aún no hay centros de acopio publicados. Vuelve pronto: los centros de
          la red están registrando sus sedes.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 border-y border-border/70 py-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div
            role="tablist"
            aria-label="Vista de centros de acopio"
            className="inline-flex w-fit rounded-md bg-muted p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={vista === "directorio"}
              onClick={() => cambiarVista("directorio")}
              className={cn(
                "focus-ring inline-flex h-8 items-center gap-2 rounded-sm px-3 text-sm transition-colors",
                vista === "directorio" ? "bg-background font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Grid2X2 className="size-4" strokeWidth={1.6} aria-hidden />
              Directorio
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={vista === "mapa"}
              onClick={() => cambiarVista("mapa")}
              className={cn(
                "focus-ring inline-flex h-8 items-center gap-2 rounded-sm px-3 text-sm transition-colors",
                vista === "mapa" ? "bg-background font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Map className="size-4" strokeWidth={1.6} aria-hidden />
              Mapa
            </button>
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            <span className="font-medium text-foreground">{visibles.length}</span>{" "}
            {visibles.length === 1 ? "centro disponible" : "centros disponibles"}
          </p>
        </div>

        <FiltrosPuntos
          valor={filtro}
          onCambio={(nuevoFiltro) => {
            setFiltro(nuevoFiltro);
            setSeleccionadoId(null);
          }}
          estados={estados}
          municipios={municipios}
        />
      </div>

      {visibles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-md bg-muted text-muted-foreground">
            <ListFilter className="size-5" strokeWidth={1.5} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium">No encontramos centros con esos filtros</p>
            <p className="mt-1 text-sm text-muted-foreground">Prueba otra ubicación o limpia la búsqueda.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setFiltro(FILTRO_INICIAL)}>
            <X aria-hidden />
            Limpiar filtros
          </Button>
        </div>
      ) : vista === "directorio" ? (
        <div
          role="tabpanel"
          className="panel-stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          {visibles.map((punto) => (
            <PuntoAcopioResultado key={punto.id} punto={punto} />
          ))}
        </div>
      ) : (
        <div
          role="tabpanel"
          className="relative grid min-h-[42rem] overflow-hidden border border-border/80 bg-muted lg:h-[calc(100svh-15rem)] lg:min-h-[36rem] lg:grid-cols-[minmax(0,1fr)_21rem]"
        >
          <div className="h-[32rem] min-h-0 lg:h-full">
            <PuntosAcopioMapaDirectorioLazy
              puntos={visibles}
              seleccionadoId={seleccionadoId}
              onSeleccionar={seleccionarPunto}
            />
          </div>
          <aside className="flex min-h-0 max-h-[26rem] flex-col overflow-hidden border-t border-border bg-background lg:h-full lg:max-h-none lg:border-t-0 lg:border-l">
            <div className="shrink-0 border-b border-border/70 px-4 py-3">
              <h2 className="text-sm font-semibold">Centros en esta zona</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Selecciona uno para centrar el mapa.</p>
            </div>
            <div className="flex min-h-0 gap-3 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-gutter:stable]">
              {visibles.map((punto) => (
                <div key={punto.id} className="w-[18rem] shrink-0 lg:w-auto">
                  <PuntoAcopioResultado
                    punto={punto}
                    compacto
                    seleccionado={punto.id === seleccionadoId}
                    onSeleccionar={() => seleccionarPunto(punto.id)}
                  />
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
