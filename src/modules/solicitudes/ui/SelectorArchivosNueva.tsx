"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Paperclip, Trash2 } from "lucide-react";
import {
  esAdjuntoValido,
  esImagenPrincipalValida,
  MAX_ADJUNTOS,
} from "@/modules/solicitudes/domain/reglasArchivos";
import { Button } from "@/shared/ui/button";
import {
  ACCEPT_ADJUNTO,
  ACCEPT_IMAGEN,
  formatearTamano,
  iconoDeContentType,
} from "./archivos";

// Panel de la pantalla de creación: RECOLECTA la imagen principal y los documentos con
// previsualización local (blob), pero NO los sube. La subida real ocurre tras crear la
// solicitud, cuando ya hay `id` (la orquesta `NuevaSolicitudCliente`). Reusa las mismas
// reglas de dominio y el mismo lenguaje visual que `ArchivosSolicitud` (feature 031).

type Props = {
  principal: File | null;
  adjuntos: File[];
  onPrincipalChange: (file: File | null) => void;
  onAdjuntosChange: (files: File[]) => void;
  subiendo: boolean;
  error: string | null;
  onError: (mensaje: string | null) => void;
};

export function SelectorArchivosNueva({
  principal,
  adjuntos,
  onPrincipalChange,
  onAdjuntosChange,
  subiendo,
  error,
  onError,
}: Props) {
  const inputPrincipal = useRef<HTMLInputElement>(null);
  const inputAdjunto = useRef<HTMLInputElement>(null);

  // Previsualización local de la imagen principal: se deriva del File elegido y se revoca
  // el blob anterior cuando cambia o al desmontar (evita fugas de memoria).
  const previewPrincipal = useMemo(
    () => (principal ? URL.createObjectURL(principal) : null),
    [principal],
  );
  useEffect(() => {
    if (!previewPrincipal) return;
    return () => URL.revokeObjectURL(previewPrincipal);
  }, [previewPrincipal]);

  const adjuntosLleno = adjuntos.length >= MAX_ADJUNTOS;

  function elegirPrincipal(file: File): void {
    onError(null);
    if (!esImagenPrincipalValida(file.type, file.size)) {
      onError(
        "La imagen principal debe ser JPG, PNG o WEBP y pesar 5 MB o menos.",
      );
      return;
    }
    onPrincipalChange(file);
  }

  function agregarAdjuntos(files: File[]): void {
    onError(null);
    const espacio = MAX_ADJUNTOS - adjuntos.length;
    const validos: File[] = [];
    let huboInvalido = false;
    for (const file of files) {
      if (validos.length >= espacio) break;
      if (esAdjuntoValido(file.type, file.size)) validos.push(file);
      else huboInvalido = true;
    }
    if (huboInvalido) {
      onError(
        "Algún documento no es válido: usa imagen, PDF o Word de 10 MB o menos.",
      );
    } else if (files.length > espacio) {
      onError(`Solo puedes adjuntar ${MAX_ADJUNTOS} documentos.`);
    }
    if (validos.length > 0) onAdjuntosChange([...adjuntos, ...validos]);
  }

  return (
    <fieldset className="flex flex-col gap-6 rounded-xl border border-border bg-muted/20 p-5">
      <legend className="px-1 text-sm font-medium">
        Imagen y documentación
      </legend>

      {/* Imagen principal */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Imagen principal
        </span>
        <input
          ref={inputPrincipal}
          type="file"
          accept={ACCEPT_IMAGEN}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) elegirPrincipal(file);
            e.target.value = "";
          }}
        />

        {principal ? (
          <div className="flex flex-col gap-3">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-muted">
              {previewPrincipal && (
                <Image
                  src={previewPrincipal}
                  alt="Vista previa de la imagen principal"
                  fill
                  sizes="(max-width: 1024px) 100vw, 20rem"
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="numeric-tnum truncate font-mono text-xs text-muted-foreground">
                {formatearTamano(principal.size)}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={subiendo}
                  onClick={() => inputPrincipal.current?.click()}
                >
                  Reemplazar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={subiendo}
                  onClick={() => onPrincipalChange(null)}
                >
                  <Trash2 strokeWidth={1.5} />
                  Quitar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={subiendo}
            onClick={() => inputPrincipal.current?.click()}
            className="focus-ring flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background/60 text-muted-foreground transition-colors hover:bg-background disabled:opacity-60"
          >
            <ImagePlus strokeWidth={1.5} className="size-6" />
            <span className="text-sm">Añadir imagen principal</span>
            <span className="text-xs">JPG, PNG o WEBP, hasta 5 MB</span>
          </button>
        )}
      </div>

      {/* Documentos adjuntos */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Documentación ({adjuntos.length}/{MAX_ADJUNTOS})
        </span>
        <input
          ref={inputAdjunto}
          type="file"
          accept={ACCEPT_ADJUNTO}
          multiple
          hidden
          onChange={(e) => {
            agregarAdjuntos(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />

        {adjuntos.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border bg-background">
            {adjuntos.map((archivo, index) => {
              const Icono = iconoDeContentType(archivo.type);
              return (
                <li
                  key={`${archivo.name}-${index}`}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <Icono
                    strokeWidth={1.5}
                    className="size-5 shrink-0 text-muted-foreground"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm text-foreground">
                      {archivo.name}
                    </span>
                    <span className="numeric-tnum font-mono text-xs text-muted-foreground">
                      {formatearTamano(archivo.size)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Quitar ${archivo.name}`}
                    disabled={subiendo}
                    onClick={() =>
                      onAdjuntosChange(adjuntos.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 strokeWidth={1.5} />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={subiendo || adjuntosLleno}
            onClick={() => inputAdjunto.current?.click()}
          >
            {subiendo ? (
              <Loader2 strokeWidth={1.5} className="animate-spin" />
            ) : (
              <Paperclip strokeWidth={1.5} />
            )}
            Añadir documento
          </Button>
          {adjuntosLleno && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Has alcanzado el máximo de {MAX_ADJUNTOS} documentos.
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Los archivos se subirán al crear la solicitud.
      </p>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
