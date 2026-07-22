"use client";

import { useRef, useState } from "react";
import { Loader2, Paperclip, Trash2 } from "lucide-react";
import {
  esEvidenciaValida,
  MAX_EVIDENCIAS,
} from "@/modules/auditoria/domain";
import type { EvidenciaVista } from "@/shared/auditoria";
import { Button } from "@/shared/ui/button";
import {
  eliminarEvidenciaAction,
} from "@/app/(app)/auditoria/solicitudes/actions";
import {
  ACCEPT_EVIDENCIA,
  formatearTamano,
  iconoDeContentType,
} from "./evidenciaArchivos";
import { subirEvidenciaDirecto } from "./subirEvidencia";

type Item = {
  id: string;
  nombreOriginal: string;
  contentType: string;
  tamanoBytes: number;
  url: string | null;
};

type Props = {
  solicitudId: string;
  evidenciasIniciales: EvidenciaVista[];
};

// Subida de evidencia física de verificación por el AUDITOR mientras tiene la solicitud
// en revisión (feature 032). Sube DIRECTO al almacenamiento (pide URL firmada, hace PUT,
// confirma). Interna: solo la ven auditores y administradores.
export function EvidenciaAuditoria({ solicitudId, evidenciasIniciales }: Props) {
  const [items, setItems] = useState<Item[]>(() =>
    evidenciasIniciales.map((e) => ({
      id: e.id,
      nombreOriginal: e.nombreOriginal,
      contentType: e.contentType,
      tamanoBytes: e.tamanoBytes,
      url: e.url,
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<"subir" | "eliminar" | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const lleno = items.length >= MAX_EVIDENCIAS;

  async function subir(file: File): Promise<void> {
    setError(null);
    if (!esEvidenciaValida(file.type, file.size)) {
      setError(
        "La evidencia debe ser imagen, video o PDF, y pesar 50 MB o menos.",
      );
      return;
    }

    setOcupado("subir");
    try {
      const resultado = await subirEvidenciaDirecto(solicitudId, file);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setItems((previos) => [
        ...previos,
        {
          id: resultado.evidencia.id,
          nombreOriginal: resultado.evidencia.nombreOriginal,
          contentType: resultado.evidencia.contentType,
          tamanoBytes: resultado.evidencia.tamanoBytes,
          url: URL.createObjectURL(file),
        },
      ]);
    } catch {
      setError("No se pudo procesar la evidencia. Inténtalo de nuevo.");
    } finally {
      setOcupado(null);
    }
  }

  async function eliminar(item: Item): Promise<void> {
    setError(null);
    setOcupado("eliminar");
    try {
      const resultado = await eliminarEvidenciaAction(item.id, solicitudId);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      if (item.url?.startsWith("blob:")) URL.revokeObjectURL(item.url);
      setItems((previos) => previos.filter((i) => i.id !== item.id));
    } catch {
      setError("No se pudo eliminar la evidencia. Inténtalo de nuevo.");
    } finally {
      setOcupado(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold">
          Evidencia de verificación ({items.length}/{MAX_EVIDENCIAS})
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Fotos, capturas, video o PDF que respalden tu comprobación. Es interna:
          solo la ven auditores y administración.
        </p>
      </div>

      <input
        ref={input}
        type="file"
        accept={ACCEPT_EVIDENCIA}
        multiple
        hidden
        onChange={(e) => {
          const archivos = Array.from(e.target.files ?? []);
          void (async () => {
            for (const file of archivos) await subir(file);
          })();
          e.target.value = "";
        }}
      />

      {items.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border bg-background">
          {items.map((item) => {
            const Icono = iconoDeContentType(item.contentType);
            return (
              <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                <Icono
                  strokeWidth={1.5}
                  className="size-5 shrink-0 text-muted-foreground"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-sm text-primary-ink underline-offset-4 hover:underline"
                    >
                      {item.nombreOriginal}
                    </a>
                  ) : (
                    <span className="truncate text-sm text-foreground">
                      {item.nombreOriginal}
                    </span>
                  )}
                  <span className="numeric-tnum font-mono text-xs text-muted-foreground">
                    {formatearTamano(item.tamanoBytes)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Quitar ${item.nombreOriginal}`}
                  disabled={ocupado !== null}
                  onClick={() => void eliminar(item)}
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
          disabled={ocupado !== null || lleno}
          onClick={() => input.current?.click()}
        >
          {ocupado === "subir" ? (
            <Loader2 strokeWidth={1.5} className="animate-spin" />
          ) : (
            <Paperclip strokeWidth={1.5} />
          )}
          Añadir evidencia
        </Button>
        {lleno && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Has alcanzado el máximo de {MAX_EVIDENCIAS} evidencias.
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
