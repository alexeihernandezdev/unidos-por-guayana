"use client";

import { MapPinned } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Estado } from "@/modules/ubicacion/domain/Estado";
import type { Municipio } from "@/modules/ubicacion/domain/Municipio";
import { Button } from "@/shared/ui/button";
import {
  FILTRO_INICIAL,
  FiltrosPuntos,
  filtrarPuntos,
  type FiltroPuntosValor,
} from "./FiltrosPuntos";
import {
  PuntoAcopioCard,
  type PuntoAcopioConUbicacion,
} from "./PuntoAcopioCard";

// Directorio de puntos de acopio para el colaborador (feature 011): responde
// "¿a dónde llevo lo que aporto?". Grid de cards con búsqueda y filtro por
// ubicación; cada card lleva CTAs a Maps/WhatsApp y su vista de detalle.

type Props = {
  puntos: PuntoAcopioConUbicacion[];
  estados: Estado[];
  municipios: Municipio[];
};

export function PuntosAcopioDirectorio({ puntos, estados, municipios }: Props) {
  const [filtro, setFiltro] = useState<FiltroPuntosValor>(FILTRO_INICIAL);

  const visibles = filtrarPuntos(puntos, filtro);

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
          Aún no hay puntos de acopio publicados. Vuelve pronto: los centros de
          la red están registrando sus sedes.
        </p>
      </div>
    );
  }

  return (
    <>
      <FiltrosPuntos
        valor={filtro}
        onCambio={setFiltro}
        estados={estados}
        municipios={municipios}
      />

      {visibles.length === 0 ? (
        <p className="border-t border-border py-12 text-center text-sm text-muted-foreground">
          Ningún punto coincide con los filtros.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibles.map((punto) => (
            <PuntoAcopioCard
              key={punto.id}
              punto={punto}
              acciones={
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href={`/puntos-acopio/${punto.id}`}>Ver detalle</Link>
                </Button>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
