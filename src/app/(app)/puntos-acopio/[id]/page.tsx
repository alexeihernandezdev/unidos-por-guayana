import { ArrowLeft, Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PuntoAcopioMapaLazy } from "@/modules/acopio/ui/PuntoAcopioMapaLazy";
import { urlMaps, urlWhatsApp } from "@/modules/acopio/ui/PuntoAcopioCard";
import { IconoWhatsApp } from "@/modules/acopio/ui/IconoWhatsApp";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { verPuntoAcopioActivoServicio } from "@/shared/acopio";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import { cargarCatalogoUbicacion } from "@/shared/ubicacion";

export const metadata: Metadata = {
  title: "Punto de acopio",
};

type Props = {
  params: Promise<{ id: string }>;
};

// Detalle de un punto activo para el colaborador (feature 011): mapa grande,
// horarios y contacto. Un punto archivado o inexistente hace 404; nunca se
// muestran datos del admin dueño.
export default async function DetallePuntoAcopioPage({ params }: Props) {
  await requireRol(Rol.COLABORADOR);
  const { id } = await params;

  const [punto, catalogo] = await Promise.all([
    verPuntoAcopioActivoServicio(id),
    cargarCatalogoUbicacion(),
  ]);
  if (!punto) notFound();

  const estadoNombre =
    catalogo.estados.find((e) => e.id === punto.estadoId)?.nombre ?? "";
  const municipioNombre =
    catalogo.municipios.find((m) => m.id === punto.municipioId)?.nombre ?? "";
  const coordenadas = {
    latitud: Number(punto.latitud),
    longitud: Number(punto.longitud),
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 md:p-8">
      <Link
        href="/puntos-acopio"
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft strokeWidth={1.5} className="size-4" aria-hidden="true" />
        Todos los puntos
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {punto.nombre}
        </h1>
        <p className="text-sm text-muted-foreground">{punto.referencia}</p>
      </div>

      <div className="h-80 overflow-hidden rounded-lg border md:h-96">
        <PuntoAcopioMapaLazy centro={coordenadas} zoom={16} valor={coordenadas} />
      </div>

      <div className="grid gap-6 border-t border-border pt-6 md:grid-cols-2">
        <ul className="flex flex-col gap-2.5 text-sm">
          <li className="flex items-center gap-2">
            <MapPin
              strokeWidth={1.5}
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            {municipioNombre}, {estadoNombre}
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
              {punto.correo}
            </li>
          )}
        </ul>

        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex w-full flex-col gap-2 sm:max-w-64">
            <Button asChild>
              <a
                href={urlMaps(punto)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin strokeWidth={1.5} aria-hidden="true" />
                Cómo llegar
              </a>
            </Button>
            {punto.telefonoEsWhatsApp ? (
              <Button asChild variant="outline">
                <a
                  href={urlWhatsApp(punto.telefono)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconoWhatsApp className="size-4" aria-hidden="true" />
                  Escribir por WhatsApp
                </a>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <a href={`tel:${punto.telefono.replace(/\s/g, "")}`}>
                  <Phone strokeWidth={1.5} aria-hidden="true" />
                  Llamar
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
