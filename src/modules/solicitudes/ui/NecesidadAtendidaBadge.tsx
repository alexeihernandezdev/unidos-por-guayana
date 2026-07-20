import Link from "next/link";
import { ArrowUpRight, HeartHandshake } from "lucide-react";

// Badge "Atendido por actividad X" (feature 030). Aparece junto a un recurso de la
// solicitud cuando un ADMIN lo vinculó a una actividad. Enlaza a la actividad; el
// destino depende de quién mira, vía `basePath` (`/panel/actividades` para el ADMIN,
// `/actividades` para el solicitante).
export function NecesidadAtendidaBadge({
  atencion,
  basePath,
}: {
  atencion: { actividadId: string; actividadTitulo: string };
  basePath: string;
}) {
  return (
    <Link
      href={`${basePath}/${atencion.actividadId}`}
      className="focus-ring group/badge inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 py-0.5 pr-1.5 pl-2.5 text-xs font-medium text-primary-ink transition-colors duration-150 ease-[var(--ease-out-emil)] hover:bg-primary/10"
    >
      <HeartHandshake className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
      <span className="truncate">
        Atendido por {atencion.actividadTitulo}
      </span>
      <ArrowUpRight
        className="size-3 shrink-0 opacity-70 transition-transform duration-150 ease-[var(--ease-out-emil)] group-hover/badge:translate-x-0.5 group-hover/badge:-translate-y-0.5 motion-reduce:transition-none"
        strokeWidth={2}
        aria-hidden
      />
    </Link>
  );
}
