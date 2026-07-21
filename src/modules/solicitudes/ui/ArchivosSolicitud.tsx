"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Paperclip, Trash2 } from "lucide-react";
import { TipoArchivoSolicitud } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import type { TipoArchivoSolicitud as TipoArchivo } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import {
  esAdjuntoValido,
  esImagenPrincipalValida,
} from "@/modules/solicitudes/domain/reglasArchivos";
import type { ArchivoVista } from "@/shared/solicitudes";
import { Button } from "@/shared/ui/button";
import {
  confirmarArchivoAction,
  eliminarArchivoAction,
  prepararSubidaArchivoAction,
} from "@/app/(app)/solicitudes/actions";
import {
  ACCEPT_ADJUNTO,
  ACCEPT_IMAGEN,
  formatearTamano,
  iconoDeContentType,
} from "./archivos";

type Props = {
  solicitudId: string;
  principalInicial: ArchivoVista | null;
  adjuntosIniciales: ArchivoVista[];
};

// Sube la imagen principal y los documentos de una solicitud DIRECTO al almacenamiento:
// pide una URL firmada al servidor, hace PUT del binario, y confirma los metadatos. El
// archivo nunca pasa por el servidor de la app (feature 031). Solo se usa en edición,
// cuando la solicitud ya existe y sigue ABIERTA.
export function ArchivosSolicitud({
  solicitudId,
  principalInicial,
  adjuntosIniciales,
}: Props) {
  const [principal, setPrincipal] = useState<ArchivoVista | null>(
    principalInicial,
  );
  const [adjuntos, setAdjuntos] = useState<ArchivoVista[]>(adjuntosIniciales);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<TipoArchivo | "eliminar" | null>(null);

  const inputPrincipal = useRef<HTMLInputElement>(null);
  const inputAdjunto = useRef<HTMLInputElement>(null);

  async function subir(file: File, tipo: TipoArchivo): Promise<void> {
    setError(null);

    const valido =
      tipo === TipoArchivoSolicitud.PRINCIPAL
        ? esImagenPrincipalValida(file.type, file.size)
        : esAdjuntoValido(file.type, file.size);
    if (!valido) {
      setError(
        tipo === TipoArchivoSolicitud.PRINCIPAL
          ? "La imagen principal debe ser JPG, PNG o WEBP y pesar 5 MB o menos."
          : "El adjunto debe ser una imagen, un PDF o un documento Word, y pesar 10 MB o menos.",
      );
      return;
    }

    setOcupado(tipo);
    try {
      const prep = await prepararSubidaArchivoAction({
        solicitudId,
        tipo,
        contentType: file.type,
        tamanoBytes: file.size,
      });
      if (!prep.ok) {
        setError(prep.error);
        return;
      }

      const subida = await fetch(prep.url, {
        method: "PUT",
        headers: { "content-type": file.type, "x-upsert": "true" },
        body: file,
      });
      if (!subida.ok) {
        setError("No se pudo subir el archivo. Inténtalo de nuevo.");
        return;
      }

      const confirmado = await confirmarArchivoAction({
        solicitudId,
        tipo,
        path: prep.path,
        nombreOriginal: file.name,
        contentType: file.type,
        tamanoBytes: file.size,
      });
      if (!confirmado.ok) {
        setError(confirmado.error);
        return;
      }

      // Vista previa inmediata sin recargar: enlace local al archivo elegido.
      const vista: ArchivoVista = {
        id: confirmado.archivo.id,
        tipo: confirmado.archivo.tipo,
        nombreOriginal: confirmado.archivo.nombreOriginal,
        contentType: confirmado.archivo.contentType,
        tamanoBytes: confirmado.archivo.tamanoBytes,
        url: URL.createObjectURL(file),
      };
      if (tipo === TipoArchivoSolicitud.PRINCIPAL) {
        if (principal?.url?.startsWith("blob:")) URL.revokeObjectURL(principal.url);
        setPrincipal(vista);
      } else {
        setAdjuntos((previos) => [...previos, vista]);
      }
    } catch {
      setError("No se pudo procesar el archivo. Inténtalo de nuevo.");
    } finally {
      setOcupado(null);
    }
  }

  async function eliminar(archivo: ArchivoVista): Promise<void> {
    setError(null);
    setOcupado("eliminar");
    try {
      const resultado = await eliminarArchivoAction(archivo.id, solicitudId);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      if (archivo.url?.startsWith("blob:")) URL.revokeObjectURL(archivo.url);
      if (archivo.tipo === TipoArchivoSolicitud.PRINCIPAL) {
        setPrincipal(null);
      } else {
        setAdjuntos((previos) => previos.filter((a) => a.id !== archivo.id));
      }
    } catch {
      setError("No se pudo eliminar el archivo. Inténtalo de nuevo.");
    } finally {
      setOcupado(null);
    }
  }

  const subiendoPrincipal = ocupado === TipoArchivoSolicitud.PRINCIPAL;
  const subiendoAdjunto = ocupado === TipoArchivoSolicitud.ADJUNTO;
  const adjuntosLleno = adjuntos.length >= 10;

  return (
    <fieldset className="flex flex-col gap-6 border-t border-border pt-4">
      <legend className="text-sm font-medium">Imagen y documentación</legend>

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
            if (file) void subir(file, TipoArchivoSolicitud.PRINCIPAL);
            e.target.value = "";
          }}
        />

        {principal ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative size-24 overflow-hidden rounded-lg border border-border bg-muted">
              {principal.url && (
                <Image
                  src={principal.url}
                  alt="Imagen principal de la solicitud"
                  fill
                  sizes="6rem"
                  className="object-cover"
                  unoptimized={principal.url.startsWith("blob:")}
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={ocupado !== null}
                onClick={() => inputPrincipal.current?.click()}
              >
                {subiendoPrincipal ? (
                  <Loader2 strokeWidth={1.5} className="animate-spin" />
                ) : null}
                Reemplazar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={ocupado !== null}
                onClick={() => void eliminar(principal)}
              >
                <Trash2 strokeWidth={1.5} />
                Quitar
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={ocupado !== null}
            onClick={() => inputPrincipal.current?.click()}
            className="focus-ring flex aspect-[16/9] w-full max-w-md flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            {subiendoPrincipal ? (
              <Loader2 strokeWidth={1.5} className="size-6 animate-spin" />
            ) : (
              <ImagePlus strokeWidth={1.5} className="size-6" />
            )}
            <span className="text-sm">Añadir imagen principal</span>
            <span className="text-xs">JPG, PNG o WEBP, hasta 5 MB</span>
          </button>
        )}
      </div>

      {/* Documentos adjuntos */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Documentación ({adjuntos.length}/10)
        </span>
        <input
          ref={inputAdjunto}
          type="file"
          accept={ACCEPT_ADJUNTO}
          multiple
          hidden
          onChange={(e) => {
            const archivos = Array.from(e.target.files ?? []);
            void (async () => {
              for (const file of archivos) {
                await subir(file, TipoArchivoSolicitud.ADJUNTO);
              }
            })();
            e.target.value = "";
          }}
        />

        {adjuntos.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {adjuntos.map((archivo) => {
              const Icono = iconoDeContentType(archivo.contentType);
              return (
                <li
                  key={archivo.id}
                  className="flex items-center gap-3 px-4 py-2.5"
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Quitar ${archivo.nombreOriginal}`}
                    disabled={ocupado !== null}
                    onClick={() => void eliminar(archivo)}
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
            disabled={ocupado !== null || adjuntosLleno}
            onClick={() => inputAdjunto.current?.click()}
          >
            {subiendoAdjunto ? (
              <Loader2 strokeWidth={1.5} className="animate-spin" />
            ) : (
              <Paperclip strokeWidth={1.5} />
            )}
            Añadir documento
          </Button>
          {adjuntosLleno && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Has alcanzado el máximo de 10 documentos.
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
