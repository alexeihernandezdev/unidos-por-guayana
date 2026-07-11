"use client";

import { divIcon, latLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { PuntoAcopioConUbicacion } from "./PuntoAcopioCard";

type Props = {
  puntos: PuntoAcopioConUbicacion[];
  seleccionadoId: string | null;
  onSeleccionar: (id: string) => void;
};

function iconoMarcador(seleccionado: boolean) {
  return divIcon({
    className: "",
    html: `<div class="acopio-map-pin${seleccionado ? " is-selected" : ""}"><span></span></div>`,
    iconSize: seleccionado ? [34, 34] : [28, 28],
    iconAnchor: seleccionado ? [17, 30] : [14, 25],
  });
}

function iconoCluster(cluster: { getChildCount: () => number }) {
  const cantidad = cluster.getChildCount();
  const tamano = cantidad < 10 ? "sm" : cantidad < 50 ? "md" : "lg";

  return divIcon({
    className: "acopio-map-cluster-wrapper",
    html: `<div class="acopio-map-cluster acopio-map-cluster-${tamano}"><span>${cantidad}</span></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function AjustarVista({ puntos }: { puntos: PuntoAcopioConUbicacion[] }) {
  const map = useMap();

  useEffect(() => {
    if (puntos.length === 0) return;
    if (puntos.length === 1) {
      map.setView([Number(puntos[0].latitud), Number(puntos[0].longitud)], 15);
      return;
    }
    const limites = latLngBounds(
      puntos.map((punto) => [Number(punto.latitud), Number(punto.longitud)]),
    );
    map.fitBounds(limites, { padding: [44, 44], maxZoom: 15 });
  }, [map, puntos]);

  return null;
}

function CentrarSeleccion({ punto }: { punto: PuntoAcopioConUbicacion | null }) {
  const map = useMap();

  useEffect(() => {
    if (!punto) return;
    map.flyTo([Number(punto.latitud), Number(punto.longitud)], Math.max(map.getZoom(), 15), {
      duration: 0.45,
    });
  }, [map, punto]);

  return null;
}

export function PuntosAcopioMapaDirectorio({
  puntos,
  seleccionadoId,
  onSeleccionar,
}: Props) {
  const seleccionado = useMemo(
    () => puntos.find((punto) => punto.id === seleccionadoId) ?? null,
    [puntos, seleccionadoId],
  );

  return (
    <MapContainer
      center={[10.6, -66.9]}
      zoom={10}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AjustarVista puntos={puntos} />
      <CentrarSeleccion punto={seleccionado} />
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={56}
        disableClusteringAtZoom={17}
        spiderfyOnMaxZoom
        spiderfyDistanceMultiplier={1.35}
        showCoverageOnHover={false}
        zoomToBoundsOnClick
        iconCreateFunction={iconoCluster}
      >
        {puntos.map((punto) => (
          <Marker
            key={punto.id}
            position={[Number(punto.latitud), Number(punto.longitud)]}
            icon={iconoMarcador(punto.id === seleccionadoId)}
            zIndexOffset={punto.id === seleccionadoId ? 500 : 0}
            eventHandlers={{ click: () => onSeleccionar(punto.id) }}
            title={punto.nombre}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
