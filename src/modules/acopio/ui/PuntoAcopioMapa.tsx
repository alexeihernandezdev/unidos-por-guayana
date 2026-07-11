"use client";

import { divIcon, type LeafletMouseEvent, type Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

// Mapa Leaflet del punto de acopio (feature 011). Client-only: Leaflet toca
// `window` al importar, así que este componente SIEMPRE se carga vía
// `PuntoAcopioMapaLazy` (next/dynamic, ssr: false). Interacción: click coloca
// el marcador, arrastrar el marcador lo reposiciona. Sin `onCambio` el mapa es
// de solo lectura (vista del colaborador).

export type CoordenadasMapa = {
  latitud: number;
  longitud: number;
};

type Props = {
  /** Centro inicial (capital del estado del admin, o Venezuela). */
  centro: CoordenadasMapa;
  zoom?: number;
  /** Posición del marcador; `null` hasta que el usuario marque. */
  valor: CoordenadasMapa | null;
  /** Callback al marcar/arrastrar. Ausente → mapa de solo lectura. */
  onCambio?: (coordenadas: CoordenadasMapa) => void;
  /**
   * Destino de vuelo (resultado del buscador). Al cambiar, el mapa vuela ahí.
   * Se compara por identidad de objeto: crear uno nuevo por selección.
   */
  vuelo?: CoordenadasMapa | null;
};

// Marcador propio en el ocre de identidad (--primary). Un `divIcon` con SVG
// inline evita los PNG rotos del icono default de Leaflet bajo bundlers y nos
// da el pin en el color de la marca sin assets extra.
const PIN = divIcon({
  className: "", // sin estilos default de Leaflet
  html: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="filter: drop-shadow(0 2px 2px rgb(0 0 0 / 0.25))">
    <path d="M12 2C7.9 2 4.5 5.4 4.5 9.5c0 5.2 6.4 11.6 7 12.2a.7.7 0 0 0 1 0c.6-.6 7-7 7-12.2C19.5 5.4 16.1 2 12 2Z" fill="var(--primary)" stroke="var(--background)" stroke-width="1.2"/>
    <circle cx="12" cy="9.5" r="2.8" fill="var(--background)"/>
  </svg>`,
  iconSize: [34, 34],
  iconAnchor: [17, 32],
});

// El zoom al volar a un resultado del buscador: cercano, nivel calle.
const ZOOM_VUELO = 16;

function ClickEnMapa({ onCambio }: { onCambio: (c: CoordenadasMapa) => void }) {
  useMapEvents({
    click(evento: LeafletMouseEvent) {
      onCambio({ latitud: evento.latlng.lat, longitud: evento.latlng.lng });
    },
  });
  return null;
}

function VueloA({ destino }: { destino: CoordenadasMapa }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([destino.latitud, destino.longitud], ZOOM_VUELO, {
      duration: 0.8,
    });
  }, [map, destino]);
  return null;
}

export function PuntoAcopioMapa({
  centro,
  zoom = 13,
  valor,
  onCambio,
  vuelo = null,
}: Props) {
  const markerRef = useRef<LeafletMarker | null>(null);

  const manejadoresMarcador = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (!marker || !onCambio) return;
        const pos = marker.getLatLng();
        onCambio({ latitud: pos.lat, longitud: pos.lng });
      },
    }),
    [onCambio],
  );

  return (
    <MapContainer
      center={[centro.latitud, centro.longitud]}
      zoom={zoom}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onCambio && <ClickEnMapa onCambio={onCambio} />}
      {vuelo && <VueloA destino={vuelo} />}
      {valor && (
        <Marker
          ref={markerRef}
          position={[valor.latitud, valor.longitud]}
          icon={PIN}
          draggable={Boolean(onCambio)}
          eventHandlers={manejadoresMarcador}
        />
      )}
    </MapContainer>
  );
}
