import { MapPin, MessageSquareQuote } from "lucide-react";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { cn } from "@/shared/lib/utils";
import type { Testimonio } from "../domain/Testimonio";
import {
  ESTADO_TESTIMONIO_CLASE,
  ESTADO_TESTIMONIO_LABEL,
  iniciales,
} from "./presentacion";

const ROL_LABEL: Partial<Record<Rol, string>> = {
  [Rol.COLABORADOR]: "Colaborador",
  [Rol.SOLICITANTE]: "Solicitante",
};

type Props = {
  testimonio: Testimonio;
  mostrarEstado?: boolean;
  className?: string;
  headingLevel?: "h2" | "h3";
  children?: React.ReactNode;
};

export function TestimonioCard({
  testimonio,
  mostrarEstado = false,
  className,
  headingLevel = "h2",
  children,
}: Props) {
  const Heading = headingLevel;
  const ubicacion = [testimonio.autor.municipio, testimonio.autor.estado]
    .filter(Boolean)
    .join(", ");

  return (
    <article
      className={cn(
        "card-lift flex h-full min-w-0 flex-col rounded-xl border border-border/70 bg-card p-5 shadow-xs",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-semibold text-primary-ink">
          {iniciales(testimonio.autor.nombre)}
        </span>
        <div className="flex flex-wrap justify-end gap-2">
          {testimonio.destacado ? (
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary-ink">
              Destacado
            </span>
          ) : null}
          {mostrarEstado ? (
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-xs font-medium",
                ESTADO_TESTIMONIO_CLASE[testimonio.estado],
              )}
            >
              {ESTADO_TESTIMONIO_LABEL[testimonio.estado]}
            </span>
          ) : null}
        </div>
      </div>

      <MessageSquareQuote
        className="mt-6 size-6 text-primary-ink"
        strokeWidth={1.5}
        aria-hidden
      />
      <Heading className="mt-4 text-lg font-semibold leading-snug tracking-tight [text-wrap:balance]">
        {testimonio.titulo}
      </Heading>
      <blockquote className="mt-3 whitespace-pre-line text-sm leading-6 text-foreground/80 [text-wrap:pretty]">
        “{testimonio.contenido}”
      </blockquote>

      {testimonio.solicitud ? (
        <p className="mt-5 inline-flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-foreground/75">
          <MapPin className="size-3.5 text-primary-ink" strokeWidth={1.5} aria-hidden />
          Historia vinculada a una solicitud en {testimonio.solicitud.sector}
        </p>
      ) : null}

      <footer className="mt-auto border-t border-border/70 pt-5">
        <p className="text-sm font-semibold text-foreground">
          {testimonio.autor.nombre}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {ROL_LABEL[testimonio.autor.rol] ?? "Miembro de la comunidad"}
          {ubicacion ? ` · ${ubicacion}` : ""}
        </p>
      </footer>

      {testimonio.motivoRechazo ? (
        <div className="mt-4 rounded-lg border border-destructive/25 bg-destructive/5 p-3">
          <p className="text-xs font-semibold text-destructive">Motivo de revisión</p>
          <p className="mt-1 text-sm leading-5 text-foreground/80">
            {testimonio.motivoRechazo}
          </p>
        </div>
      ) : null}

      {children ? <div className="mt-4 border-t border-border/70 pt-4">{children}</div> : null}
    </article>
  );
}
