import { Clock, Mail, MapPin, Phone, Warehouse } from "lucide-react";
import type { PuntoAcopio } from "@/modules/acopio/domain/PuntoAcopio";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { IconoWhatsApp } from "./IconoWhatsApp";

// Card de un punto de acopio (feature 011). Compartida entre la gestión del
// ADMIN (con acciones) y el directorio del colaborador. Placeholder de foto a
// la espera del campo imagen (mejora futura); CTAs a Google Maps (cómo llegar)
// y a WhatsApp cuando el teléfono lo tiene.

export type PuntoAcopioConUbicacion = PuntoAcopio & {
  municipioNombre: string;
  estadoNombre: string;
};

/** URL "cómo llegar" en Google Maps a partir de las coordenadas. */
export function urlMaps(punto: Pick<PuntoAcopio, "latitud" | "longitud">): string {
  return `https://www.google.com/maps/search/?api=1&query=${punto.latitud},${punto.longitud}`;
}

/**
 * URL de chat de WhatsApp. Normaliza el número venezolano a E.164 sin signos:
 * quita todo lo no numérico, cae el 0 inicial (0412… → 412…) y antepone 58 si
 * no viene ya con el código de país.
 */
export function urlWhatsApp(telefono: string): string {
  const digitos = telefono.replace(/\D/g, "");
  const nacional = digitos.replace(/^0/, "");
  const e164 = nacional.startsWith("58") ? nacional : `58${nacional}`;
  return `https://wa.me/${e164}`;
}

type Props = {
  punto: PuntoAcopioConUbicacion;
  /** Badge de estado (gestión del admin). El directorio no lo muestra. */
  mostrarEstado?: boolean;
  /** Acciones extra (Editar / Archivar) que la gestión inyecta en el pie. */
  acciones?: React.ReactNode;
};

export function PuntoAcopioCard({ punto, mostrarEstado = false, acciones }: Props) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      {/* Placeholder de foto (campo imagen: mejora futura). */}
      <div className="relative flex aspect-video items-center justify-center border-b bg-muted">
        <Warehouse
          strokeWidth={1.5}
          className="size-10 text-muted-foreground/40"
          aria-hidden="true"
        />
        {mostrarEstado && (
          <Badge
            variant="outline"
            className={`absolute top-2 right-2 bg-background ${
              punto.activo ? "text-primary-ink" : "text-muted-foreground"
            }`}
          >
            {punto.activo ? "Activo" : "Archivado"}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-medium">{punto.nombre}</h3>
          <p className="text-sm text-muted-foreground">{punto.referencia}</p>
        </div>

        <ul className="flex flex-col gap-1.5 text-sm">
          <li className="flex items-center gap-2">
            <MapPin
              strokeWidth={1.5}
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            {punto.municipioNombre}, {punto.estadoNombre}
          </li>
          <li className="flex items-center gap-2">
            <Clock
              strokeWidth={1.5}
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            {punto.horarios}
          </li>
          <li className="flex items-center gap-2">
            <Phone
              strokeWidth={1.5}
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            {punto.telefono}
          </li>
          {punto.correo && (
            <li className="flex items-center gap-2">
              <Mail
                strokeWidth={1.5}
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="truncate">{punto.correo}</span>
            </li>
          )}
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-t p-4 pt-3">
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={urlMaps(punto)} target="_blank" rel="noopener noreferrer">
              <MapPin strokeWidth={1.5} aria-hidden="true" />
              Cómo llegar
            </a>
          </Button>
          {punto.telefonoEsWhatsApp ? (
            <Button asChild variant="outline" size="sm">
              <a
                href={urlWhatsApp(punto.telefono)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconoWhatsApp className="size-4" aria-hidden="true" />
                WhatsApp
              </a>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <a href={`tel:${punto.telefono.replace(/\s/g, "")}`}>
                <Phone strokeWidth={1.5} aria-hidden="true" />
                Llamar
              </a>
            </Button>
          )}
        </div>
        {acciones}
      </div>
    </Card>
  );
}
