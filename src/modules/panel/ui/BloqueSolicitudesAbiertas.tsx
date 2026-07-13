import Link from "next/link";
import {
  ArrowRightIcon,
  ChevronsDown,
  Minus,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { ConteosPorUrgencia } from "@/modules/solicitudes/application/contarSolicitudesPorUrgencia";
import type { SectorTop } from "@/modules/solicitudes/application/sectoresTop";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { URGENCIA_LABEL } from "@/modules/solicitudes/ui/urgencias";
import { cn } from "@/shared/lib/utils";
import { TONO, type Tono } from "./tonos";

type Props = {
  conteos: ConteosPorUrgencia;
  sectoresTop: SectorTop[];
};

const URGENCIAS: {
  urgencia: UrgenciaSolicitud;
  tono: Tono;
  icono: LucideIcon;
}[] = [
  { urgencia: UrgenciaSolicitud.ALTA, tono: "danger", icono: TriangleAlert },
  { urgencia: UrgenciaSolicitud.MEDIA, tono: "warning", icono: Minus },
  { urgencia: UrgenciaSolicitud.BAJA, tono: "teal", icono: ChevronsDown },
];

export function BloqueSolicitudesAbiertas({ conteos, sectoresTop }: Props) {
  return (
    <section aria-labelledby="titulo-solicitudes" className="flex flex-col gap-4">
      <h2
        id="titulo-solicitudes"
        className="text-lg font-semibold leading-none tracking-tight"
      >
        Solicitudes abiertas
      </h2>

      <ul className="grid gap-2 sm:grid-cols-3">
        {URGENCIAS.map(({ urgencia, tono, icono: Icono }) => {
          const t = TONO[tono];
          return (
            <li key={urgencia}>
              <Link
                href={`/panel/solicitudes?urgencia=${urgencia}&estado=ABIERTA`}
                className={cn(
                  "focus-ring flex flex-col gap-2 rounded-xl border p-4 transition-colors duration-150",
                  t.card,
                )}
              >
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-lg",
                    t.chip,
                  )}
                  aria-hidden
                >
                  <Icono strokeWidth={1.5} className="size-4" />
                </span>
                <span
                  className={cn(
                    "numeric-tnum font-mono text-2xl font-medium leading-none",
                    t.valor,
                  )}
                >
                  {conteos[urgencia]}
                </span>
                <span className="text-xs font-medium text-foreground/70">
                  {URGENCIA_LABEL[urgencia]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Sectores más demandados
        </h3>
        {sectoresTop.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Sin solicitudes abiertas.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {sectoresTop.map((s) => (
              <li key={s.sector}>
                <Link
                  href={`/panel/solicitudes?sector=${encodeURIComponent(s.sector)}&estado=ABIERTA`}
                  className="focus-ring group flex items-baseline justify-between gap-2 px-4 py-2 text-sm transition-colors duration-150 hover:bg-muted/40"
                >
                  <span className="truncate text-foreground">{s.sector}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="numeric-tnum font-mono text-xs text-muted-foreground">
                      {s.conteo}
                    </span>
                    <ArrowRightIcon
                      strokeWidth={1.5}
                      className="size-3 -translate-x-1 text-accent opacity-0 transition duration-150 group-hover:translate-x-0 group-hover:opacity-100"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
