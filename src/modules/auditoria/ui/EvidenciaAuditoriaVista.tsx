import { Download, ShieldCheck } from "lucide-react";
import type { EvidenciaVista } from "@/shared/auditoria";
import { formatearTamano, iconoDeContentType } from "./evidenciaArchivos";

type Props = {
  evidencias: EvidenciaVista[];
  error: boolean;
};

// Muestra la evidencia de verificación (feature 032) en solo lectura. Interna: se renderiza
// en el detalle del AUDITOR y en el panel del ADMIN, nunca para el solicitante. Si el
// almacenamiento no está disponible, degrada a los nombres sin enlace.
export function EvidenciaAuditoriaVista({ evidencias, error }: Props) {
  if (evidencias.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 border-t border-border pt-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5 text-primary-ink" strokeWidth={1.5} aria-hidden />
        <h2 className="text-lg font-semibold">
          Evidencia de verificación ({evidencias.length})
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Respaldo interno registrado por auditoría. No es visible para el solicitante.
      </p>

      {error && (
        <p className="text-sm text-muted-foreground">
          No se pudieron cargar los enlaces en este momento.
        </p>
      )}

      <ul className="divide-y divide-border rounded-lg border border-border">
        {evidencias.map((evidencia) => {
          const Icono = iconoDeContentType(evidencia.contentType);
          return (
            <li
              key={evidencia.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <Icono
                strokeWidth={1.5}
                className="size-5 shrink-0 text-muted-foreground"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm text-foreground">
                  {evidencia.nombreOriginal}
                </span>
                <span className="numeric-tnum font-mono text-xs text-muted-foreground">
                  {formatearTamano(evidencia.tamanoBytes)}
                  {evidencia.subidoPorNombre
                    ? ` · ${evidencia.subidoPorNombre}`
                    : ""}
                  {` · ciclo ${evidencia.ciclo}`}
                </span>
              </div>
              {evidencia.url ? (
                <a
                  href={evidencia.url}
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
    </section>
  );
}
