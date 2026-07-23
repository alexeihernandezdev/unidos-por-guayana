import Image from "next/image";
import { Download } from "lucide-react";
import type { AdjuntoPublico } from "@/modules/transparencia/application/obtener-detalle-publico";
import {
  formatearTamano,
  iconoDeContentType,
} from "@/modules/archivos/ui/archivos";

type Props = {
  adjuntos: AdjuntoPublico[];
};

// Galería pública de los documentos de una actividad (feature 033): las imágenes se
// muestran como cuadrícula de miniaturas que abren la imagen completa; el resto (PDF,
// Word) como lista descargable con ícono. Sin sesión: URLs públicas.
export function GaleriaAdjuntos({ adjuntos }: Props) {
  if (adjuntos.length === 0) return null;

  const imagenes = adjuntos.filter((a) => a.contentType.startsWith("image/"));
  const documentos = adjuntos.filter((a) => !a.contentType.startsWith("image/"));

  return (
    <section aria-labelledby="titulo-galeria" className="flex flex-col gap-4">
      <h2
        id="titulo-galeria"
        className="font-serif text-2xl font-medium tracking-tight text-foreground md:text-3xl"
      >
        Galería y documentos
      </h2>

      {imagenes.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {imagenes.map((img) => (
            <li key={img.id}>
              {img.url ? (
                <a
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring group relative block aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                >
                  <Image
                    src={img.url}
                    alt={img.nombreOriginal}
                    fill
                    sizes="(max-width: 640px) 50vw, 15rem"
                    className="object-cover transition-transform duration-500 ease-[var(--ease-out-emil)] group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </a>
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border bg-muted text-xs text-muted-foreground">
                  No disponible
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {documentos.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {documentos.map((doc) => {
            const Icono = iconoDeContentType(doc.contentType);
            return (
              <li key={doc.id} className="flex items-center gap-3 px-4 py-3">
                <Icono
                  strokeWidth={1.5}
                  className="size-5 shrink-0 text-muted-foreground"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm text-foreground">
                    {doc.nombreOriginal}
                  </span>
                  <span className="numeric-tnum font-mono text-xs text-muted-foreground">
                    {formatearTamano(doc.tamanoBytes)}
                  </span>
                </div>
                {doc.url ? (
                  <a
                    href={doc.url}
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
      )}
    </section>
  );
}
