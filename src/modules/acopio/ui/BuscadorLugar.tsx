"use client";

import { LoaderCircle, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Buscador de lugares para el mapa del punto de acopio (feature 011). Geocodifica
// contra Nominatim (OpenStreetMap): gratis, sin API key. Acotado a Venezuela
// (`countrycodes=ve`). Debounce de 400ms + AbortController: nunca más de una
// petición en vuelo y ~1 req/s como piden sus términos de uso. Si el servicio
// falla, el mapa sigue siendo clickeable: esto es un atajo, no un requisito.

export type LugarEncontrado = {
  nombre: string;
  latitud: number;
  longitud: number;
};

type Props = {
  onSeleccion: (lugar: LugarEncontrado) => void;
};

type RespuestaNominatim = {
  display_name: string;
  lat: string;
  lon: string;
}[];

const MIN_CARACTERES = 3;
const DEBOUNCE_MS = 400;

export function BuscadorLugar({ onSeleccion }: Props) {
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState<LugarEncontrado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [fallo, setFallo] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const cierreRef = useRef<number | null>(null);

  // Con menos de MIN_CARACTERES no se busca y el dropdown queda gateado por
  // longitud en el render (sin limpiar estado dentro del effect).
  const consultaActiva = consulta.trim().length >= MIN_CARACTERES;

  useEffect(() => {
    const texto = consulta.trim();
    if (texto.length < MIN_CARACTERES) return;

    const controlador = new AbortController();
    const temporizador = window.setTimeout(async () => {
      setBuscando(true);
      setFallo(false);
      try {
        const params = new URLSearchParams({
          q: texto,
          format: "json",
          limit: "5",
          countrycodes: "ve",
        });
        const respuesta = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          { signal: controlador.signal, headers: { Accept: "application/json" } },
        );
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        const datos = (await respuesta.json()) as RespuestaNominatim;
        setResultados(
          datos.map((d) => ({
            nombre: d.display_name,
            latitud: Number(d.lat),
            longitud: Number(d.lon),
          })),
        );
        setAbierto(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResultados([]);
        setFallo(true);
        setAbierto(true);
      } finally {
        if (!controlador.signal.aborted) setBuscando(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(temporizador);
      controlador.abort();
    };
  }, [consulta]);

  function elegir(lugar: LugarEncontrado) {
    onSeleccion(lugar);
    setAbierto(false);
    setConsulta("");
    setResultados([]);
  }

  // El blur llega antes que el click en una opción; `onMouseDown` en la opción
  // se dispara antes que el blur, así que un cierre diferido corto basta.
  function cerrarDiferido() {
    cierreRef.current = window.setTimeout(() => setAbierto(false), 150);
  }
  function cancelarCierre() {
    if (cierreRef.current !== null) window.clearTimeout(cierreRef.current);
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search
          strokeWidth={1.5}
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          onFocus={() => resultados.length > 0 && setAbierto(true)}
          onBlur={cerrarDiferido}
          onKeyDown={(e) => e.key === "Escape" && setAbierto(false)}
          placeholder="Buscar un lugar (mínimo 3 letras)…"
          aria-label="Buscar un lugar en el mapa"
          className="w-full rounded-md border bg-background py-2 pr-9 pl-9 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        {buscando && consultaActiva && (
          <LoaderCircle
            strokeWidth={1.5}
            className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </div>

      {abierto && consultaActiva && (
        <ul
          role="listbox"
          aria-label="Resultados de la búsqueda"
          onMouseDown={cancelarCierre}
          className="absolute inset-x-0 top-full z-[1100] mt-1 origin-top overflow-hidden rounded-md border bg-popover shadow-md transition-[transform,opacity] duration-150 ease-(--ease-out-emil) starting:scale-[0.98] starting:opacity-0"
        >
          {fallo ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              No se pudo buscar ahora. Marca el punto directamente en el mapa.
            </li>
          ) : resultados.length === 0 && !buscando ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Sin resultados en Venezuela para esa búsqueda.
            </li>
          ) : (
            resultados.map((lugar) => (
              <li key={`${lugar.latitud},${lugar.longitud}`}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    elegir(lugar);
                  }}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                >
                  <MapPin
                    strokeWidth={1.5}
                    className="mt-0.5 size-4 shrink-0 text-primary-ink"
                    aria-hidden="true"
                  />
                  <span className="line-clamp-2">{lugar.nombre}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
