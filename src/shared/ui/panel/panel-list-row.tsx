import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Fila (row-card) de un listado del espacio logeado. Feature 026, guía
// `constitution/ui-guidelines.md §5`. Presentación pura: no conoce el dominio;
// cada listado le pasa título/badge/secundaria/metadatos/acciones ya formateados.
// Colapsa a una columna en `< md`; semitabular en `md:`.

export type PanelListMeta = {
  icon: LucideIcon;
  texto: React.ReactNode;
  /** Etiqueta accesible del metadato (reemplaza al antiguo `<th>`). */
  label?: string;
};

type Props = {
  icon: LucideIcon;
  title: React.ReactNode;
  /** Pill de estado a la derecha del título. */
  badge?: React.ReactNode;
  /** Línea secundaria bajo el título (descripción/referencia). */
  secondary?: React.ReactNode;
  /** Línea de metadatos con icono pequeño (fecha, sector, contacto…). */
  meta?: PanelListMeta[];
  /** Acciones a la derecha (Editar / Archivar…). */
  actions?: React.ReactNode;
  className?: string;
};

export function PanelListRow({
  icon: Icon,
  title,
  badge,
  secondary,
  meta,
  actions,
  className,
}: Props) {
  return (
    <article
      className={cn(
        "flex flex-col gap-4 p-4 transition-colors duration-150 hover:bg-muted/30 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="profile-icon size-10">
          <Icon aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{title}</h2>
            {badge}
          </div>
          {secondary != null && (
            <p className="mt-0.5 text-sm text-muted-foreground">{secondary}</p>
          )}
          {meta && meta.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {meta.map(({ icon: MetaIcon, texto, label }, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                  <MetaIcon
                    className="size-3.5"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  {label && <span className="sr-only">{label}: </span>}
                  {texto}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 gap-2 md:justify-end">{actions}</div>
      )}
    </article>
  );
}
