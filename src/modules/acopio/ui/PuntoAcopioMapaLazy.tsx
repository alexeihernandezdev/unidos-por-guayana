"use client";

import dynamic from "next/dynamic";

// Carga diferida del mapa (feature 011). Leaflet depende de `window`, así que
// `ssr: false` es obligatorio; en Next 16 esa opción solo se permite dentro de
// un client component, de ahí este wrapper. El placeholder reserva el alto para
// no provocar layout shift al hidratar.
export const PuntoAcopioMapaLazy = dynamic(
  () => import("./PuntoAcopioMapa").then((m) => m.PuntoAcopioMapa),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full w-full animate-pulse rounded-[inherit] bg-muted"
        aria-hidden="true"
      />
    ),
  },
);
