"use client";

import dynamic from "next/dynamic";

export const PuntosAcopioMapaDirectorioLazy = dynamic(
  () =>
    import("./PuntosAcopioMapaDirectorio").then(
      (modulo) => modulo.PuntosAcopioMapaDirectorio,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center bg-muted text-sm text-muted-foreground">
        Cargando mapa…
      </div>
    ),
  },
);
