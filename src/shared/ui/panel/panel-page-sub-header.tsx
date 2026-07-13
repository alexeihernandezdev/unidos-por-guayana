import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Encabezado ligero de las subpáginas del espacio logeado (detalle, nuevo,
// editar, aportar, proponer-recurso). Feature 026, guía
// `constitution/ui-guidelines.md §4`. Título + "volver", sin banner, para dar
// foco al formulario. Server component (usa `<Link>`).

type Props = {
  title: string;
  backHref?: string;
  backLabel?: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PanelPageSubHeader({
  title,
  backHref,
  backLabel = "Volver",
  description,
  actions,
}: Props) {
  return (
    <header className="flex flex-col gap-2">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-sans text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}
