import { Clock, MapPin, Navigation, Phone, Warehouse } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  type PuntoAcopioConUbicacion,
  urlMaps,
  urlWhatsApp,
} from "./PuntoAcopioCard";
import { IconoWhatsApp } from "./IconoWhatsApp";

type Props = {
  punto: PuntoAcopioConUbicacion;
  seleccionado?: boolean;
  compacto?: boolean;
  onSeleccionar?: () => void;
};

export function PuntoAcopioResultado({
  punto,
  seleccionado = false,
  compacto = false,
  onSeleccionar,
}: Props) {
  const contactoHref = punto.telefonoEsWhatsApp
    ? urlWhatsApp(punto.telefono)
    : `tel:${punto.telefono.replace(/\s/g, "")}`;

  return (
    <article
      className={cn(
        "group flex flex-col rounded-lg border bg-background shadow-xs transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md",
        seleccionado
          ? "border-primary bg-primary/[0.035] shadow-sm"
          : "border-border/80 hover:border-primary/45",
        compacto ? "p-4" : "min-h-full overflow-hidden",
      )}
      data-acopio-id={punto.id}
    >
      {!compacto && (
        <div className="grid aspect-[16/7] place-items-center border-b border-border/70 bg-primary/[0.07]">
          <Warehouse
            className="size-12 text-primary-ink/35"
            strokeWidth={1.3}
            aria-hidden
          />
          <span className="sr-only">Fotografía del punto pendiente</span>
        </div>
      )}

      <div className={cn("flex flex-1 flex-col", compacto ? "" : "p-6")}>
      {onSeleccionar ? (
        <button
          type="button"
          onClick={onSeleccionar}
          className="focus-ring -m-1 block rounded-sm p-1 text-left"
          aria-pressed={seleccionado}
        >
          <ResultadoCabecera punto={punto} seleccionado={seleccionado} />
        </button>
      ) : (
        <div className="-m-1 p-1">
          <ResultadoCabecera punto={punto} seleccionado={false} />
        </div>
      )}

      <div className={cn("grid gap-3 text-sm", compacto ? "mt-4" : "mt-5 sm:grid-cols-2")}>
        <p className="flex min-w-0 items-start gap-2 text-foreground/80">
          <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} aria-hidden />
          <span className="line-clamp-2">{punto.horarios}</span>
        </p>
        {!compacto && (
          <p className="flex items-center gap-2 text-foreground/80">
            <Phone className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} aria-hidden />
            {punto.telefono}
          </p>
        )}
      </div>

      <div className={cn("mt-auto grid grid-cols-[1fr_auto] gap-3", compacto ? "pt-5" : "pt-6")}>
        <Button asChild size="sm">
          <a href={urlMaps(punto)} target="_blank" rel="noopener noreferrer">
            <Navigation aria-hidden />
            Cómo llegar
          </a>
        </Button>
        <Button asChild variant="outline" size="icon-sm">
          <a
            href={contactoHref}
            target={punto.telefonoEsWhatsApp ? "_blank" : undefined}
            rel={punto.telefonoEsWhatsApp ? "noopener noreferrer" : undefined}
            aria-label={punto.telefonoEsWhatsApp ? `Contactar ${punto.nombre} por WhatsApp` : `Llamar a ${punto.nombre}`}
            title={punto.telefonoEsWhatsApp ? "WhatsApp" : "Llamar"}
          >
            {punto.telefonoEsWhatsApp ? (
              <IconoWhatsApp className="size-4" aria-hidden />
            ) : (
              <Phone aria-hidden />
            )}
          </a>
        </Button>
      </div>

      {!compacto && (
        <Link
          href={`/puntos-acopio/${punto.id}`}
          className="focus-ring mt-3 text-center text-xs font-medium text-primary-ink underline-offset-4 hover:underline"
        >
          Ver información completa
        </Link>
      )}
      </div>
    </article>
  );
}

function ResultadoCabecera({
  punto,
  seleccionado,
}: {
  punto: PuntoAcopioConUbicacion;
  seleccionado: boolean;
}) {
  return (
    <>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-5 text-foreground">
              {punto.nombre}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" strokeWidth={1.7} aria-hidden />
              {punto.municipioNombre}, {punto.estadoNombre}
            </p>
          </div>
          {seleccionado && (
            <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" aria-label="Seleccionado" />
          )}
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-5 text-foreground/75">
          {punto.referencia}
        </p>
    </>
  );
}
