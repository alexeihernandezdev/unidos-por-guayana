import Image from "next/image";
import { Download, ImageOff } from "lucide-react";
import type { ArchivosVista } from "@/shared/solicitudes";
import { formatearTamano, iconoDeContentType } from "./archivos";

type Props = {
  archivos: ArchivosVista;
};

// Muestra la imagen principal y los adjuntos de una solicitud en las vistas de detalle
// (dueño y admin). Solo lectura. Si el almacenamiento no está disponible, degrada a los
// nombres sin enlace (feature 031).
export function ArchivosSolicitudVista({ archivos }: Props) {
  const { principal, adjuntos, error } = archivos;

  if (!principal && adjuntos.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-6">
      <h2 className="text-lg font-semibold">Imagen y documentación</h2>

      {error && (
        <p className="text-sm text-muted-foreground">
          No se pudieron cargar los archivos en este momento.
        </p>
      )}

      {principal && (
        <div className="flex flex-col gap-2">
          {principal.url ? (
            <div className="relative aspect-[16/10] w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-muted">
              <Image
                src={principal.url}
                alt="Imagen principal de la solicitud"
                fill
                sizes="(max-width: 768px) 100vw, 42rem"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/10] w-full max-w-2xl flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted text-muted-foreground">
              <ImageOff strokeWidth={1.5} className="size-6" />
              <span className="text-sm">Vista previa no disponible</span>
            </div>
          )}
        </div>
      )}

      {adjuntos.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Documentos ({adjuntos.length})
          </h3>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {adjuntos.map((archivo) => {
              const Icono = iconoDeContentType(archivo.contentType);
              return (
                <li
                  key={archivo.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <Icono
                    strokeWidth={1.5}
                    className="size-5 shrink-0 text-muted-foreground"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm text-foreground">
                      {archivo.nombreOriginal}
                    </span>
                    <span className="numeric-tnum font-mono text-xs text-muted-foreground">
                      {formatearTamano(archivo.tamanoBytes)}
                    </span>
                  </div>
                  {archivo.url ? (
                    <a
                      href={archivo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-sm text-primary-ink underline-sweep"
                    >
                      <Download strokeWidth={1.5} className="size-4" />
                      Ver
                    </a>
                  ) : (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      Enlace no disponible
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
