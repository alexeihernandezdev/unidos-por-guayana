import Link from "next/link";
import type { ConteosPorUrgencia } from "@/modules/solicitudes/application/contarSolicitudesPorUrgencia";
import type { SectorTop } from "@/modules/solicitudes/application/sectoresTop";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { URGENCIA_LABEL } from "@/modules/solicitudes/ui/urgencias";

type Props = {
  conteos: ConteosPorUrgencia;
  sectoresTop: SectorTop[];
};

const URGENCIAS: UrgenciaSolicitud[] = [
  UrgenciaSolicitud.ALTA,
  UrgenciaSolicitud.MEDIA,
  UrgenciaSolicitud.BAJA,
];

export function BloqueSolicitudesAbiertas({ conteos, sectoresTop }: Props) {
  return (
    <section
      aria-labelledby="titulo-solicitudes"
      className="flex flex-col gap-4"
    >
      <h2
        id="titulo-solicitudes"
        className="text-lg font-semibold leading-none tracking-tight"
      >
        Solicitudes abiertas
      </h2>

      <ul className="grid gap-2 sm:grid-cols-3">
        {URGENCIAS.map((urgencia) => (
          <li key={urgencia}>
            <Link
              href={`/panel/solicitudes?urgencia=${urgencia}&estado=ABIERTA`}
              className="focus-ring flex flex-col gap-1 rounded-lg border border-border px-4 py-3 transition-colors duration-150 hover:bg-muted/40"
            >
              <span className="text-xs text-foreground/70">
                {URGENCIA_LABEL[urgencia]}
              </span>
              <span className="numeric-tnum font-mono text-2xl text-foreground">
                {conteos[urgencia]}
              </span>
            </Link>
          </li>
        ))}
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
                  className="focus-ring flex items-baseline justify-between gap-2 px-4 py-2 text-sm transition-colors duration-150 hover:bg-muted/40"
                >
                  <span className="truncate text-foreground">{s.sector}</span>
                  <span className="numeric-tnum font-mono text-xs text-muted-foreground">
                    {s.conteo}
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
