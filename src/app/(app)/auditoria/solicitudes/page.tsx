import Link from "next/link";
import {
  ArrowUpRight,
  Inbox,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  EstadoVerificacionSolicitud,
  esEstadoVerificacionSolicitud,
  type FiltrosAuditoria,
} from "@/modules/auditoria/domain";
import {
  EstadoVerificacionBadge,
  ESTADO_VERIFICACION_LABEL,
  BotonAccionAuditoria,
} from "@/modules/auditoria/ui";
import {
  esUrgenciaSolicitud,
  URGENCIAS_SOLICITUD,
} from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { UrgenciaBadge } from "@/modules/solicitudes/ui/UrgenciaBadge";
import { URGENCIA_LABEL } from "@/modules/solicitudes/ui/urgencias";
import { listarAuditoriaServicio } from "@/shared/auditoria";
import { requireAuditorActivo } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import { FiltroSelect } from "@/shared/ui/filtro-select";
import { Input } from "@/shared/ui/input";
import {
  PanelEmptyState,
  PanelFilters,
  PanelFiltersField,
  PanelPage,
  PanelPageHeader,
} from "@/shared/ui/panel";
import { tomarSolicitudAction } from "./actions";

type Props = {
  searchParams: Promise<{ q?: string; estado?: string; urgencia?: string }>;
};

const FECHA = new Intl.DateTimeFormat("es-VE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function AuditoriaSolicitudesPage({ searchParams }: Props) {
  const actor = await requireAuditorActivo();
  const query = await searchParams;
  const filtros: FiltrosAuditoria = {
    estado: EstadoVerificacionSolicitud.PENDIENTE,
  };
  if (query.q?.trim()) filtros.texto = query.q.trim();
  if (query.estado && esEstadoVerificacionSolicitud(query.estado)) {
    filtros.estado = query.estado;
  }
  if (query.estado === "todos") delete filtros.estado;
  if (query.urgencia && esUrgenciaSolicitud(query.urgencia)) {
    filtros.urgencia = query.urgencia;
  }

  const [solicitudes, todas] = await Promise.all([
    listarAuditoriaServicio(actor, filtros),
    listarAuditoriaServicio(actor),
  ]);
  const pendientes = todas.filter(
    (item) => item.estadoVerificacion === EstadoVerificacionSolicitud.PENDIENTE,
  ).length;
  const mias = todas.filter(
    (item) =>
      item.estadoVerificacion === EstadoVerificacionSolicitud.EN_REVISION &&
      item.auditorActualId === actor.id,
  ).length;
  const resueltas = todas.filter(
    (item) =>
      item.estadoVerificacion !== EstadoVerificacionSolicitud.PENDIENTE &&
      item.estadoVerificacion !== EstadoVerificacionSolicitud.EN_REVISION,
  ).length;

  return (
    <PanelPage>
      <PanelPageHeader
        icon={ShieldCheck}
        eyebrow="Validación externa"
        title="Auditoría de solicitudes"
        description="Comprueba que cada petición sea real antes de habilitar su atención."
      />

      <section aria-label="Resumen de auditoría" className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Pendientes en cola", value: pendientes },
          { label: "En mi revisión", value: mias },
          { label: "Con dictamen", value: resueltas },
        ].map((metrica) => (
          <div key={metrica.label} className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
            <p className="text-sm text-muted-foreground">{metrica.label}</p>
            <p className="mt-2 font-mono text-3xl font-semibold tracking-tight numeric-tnum">
              {metrica.value}
            </p>
          </div>
        ))}
      </section>

      <PanelFilters
        activos={[filtros.texto, filtros.urgencia, query.estado].filter(Boolean).length}
        limpiarHref="/auditoria/solicitudes"
      >
        <PanelFiltersField label="Buscar" htmlFor="q">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden
            />
            <Input
              id="q"
              name="q"
              defaultValue={filtros.texto ?? ""}
              placeholder="Sector, descripción o solicitante"
              className="w-full pl-9 sm:w-72"
            />
          </div>
        </PanelFiltersField>
        <PanelFiltersField label="Estado">
          <FiltroSelect
            name="estado"
            ariaLabel="Filtrar por estado de auditoría"
            defaultValue={query.estado ?? EstadoVerificacionSolicitud.PENDIENTE}
            opciones={[
              { value: "todos", label: "Todos" },
              ...Object.values(EstadoVerificacionSolicitud).map((estado) => ({
                value: estado,
                label: ESTADO_VERIFICACION_LABEL[estado],
              })),
            ]}
          />
        </PanelFiltersField>
        <PanelFiltersField label="Urgencia">
          <FiltroSelect
            name="urgencia"
            ariaLabel="Filtrar por urgencia"
            defaultValue={filtros.urgencia ?? "todas"}
            opciones={[
              { value: "todas", label: "Todas" },
              ...URGENCIAS_SOLICITUD.map((urgencia) => ({
                value: urgencia,
                label: URGENCIA_LABEL[urgencia],
              })),
            ]}
          />
        </PanelFiltersField>
      </PanelFilters>

      {solicitudes.length === 0 ? (
        <PanelEmptyState
          icon={Inbox}
          title="No hay solicitudes"
          description="La cola no contiene solicitudes que coincidan con estos filtros."
        />
      ) : (
        <section aria-labelledby="cola-auditoria" className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="cola-auditoria" className="text-xl font-semibold tracking-tight">
                Cola de verificación
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Toma una solicitud para reservarla durante tu comprobación.
              </p>
            </div>
            <span className="font-mono text-xs text-muted-foreground numeric-tnum">
              {solicitudes.length} resultados
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {solicitudes.map((solicitud, indice) => {
              const esMia = solicitud.auditorActualId === actor.id;
              return (
                <article
                  key={solicitud.id}
                  className="audit-card group flex min-w-0 flex-col rounded-xl border border-border/70 bg-card p-5 shadow-sm"
                  style={{ "--audit-index": Math.min(indice, 8) } as React.CSSProperties}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary-ink">
                        <MapPin className="size-5" strokeWidth={1.5} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Sector</p>
                        <h3 className="truncate text-lg font-semibold tracking-tight">
                          {solicitud.sector}
                        </h3>
                      </div>
                    </div>
                    <UrgenciaBadge urgencia={solicitud.urgencia} />
                  </div>

                  <p className="mt-4 line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-foreground/80">
                    {solicitud.descripcion}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <EstadoVerificacionBadge estado={solicitud.estadoVerificacion} />
                    <span className="text-xs text-muted-foreground">
                      Ciclo {solicitud.cicloAuditoria}
                    </span>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border/70 pt-4 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Solicitante</dt>
                      <dd className="mt-1 truncate font-medium text-foreground">
                        {solicitud.solicitante.nombre}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Recibida</dt>
                      <dd className="mt-1 font-mono text-foreground numeric-tnum">
                        {FECHA.format(solicitud.createdAt)}
                      </dd>
                    </div>
                  </dl>

                  {solicitud.auditorActualNombre && !esMia ? (
                    <p className="mt-4 text-xs text-muted-foreground">
                      En revisión por {solicitud.auditorActualNombre}
                    </p>
                  ) : null}

                  <div className="mt-5 flex gap-2">
                    {solicitud.estadoVerificacion ===
                    EstadoVerificacionSolicitud.PENDIENTE ? (
                      <form action={tomarSolicitudAction} className="flex-1">
                        <input type="hidden" name="solicitudId" value={solicitud.id} />
                        <BotonAccionAuditoria
                          pendingLabel="Tomando"
                          className="h-11 w-full"
                        >
                          Tomar solicitud
                        </BotonAccionAuditoria>
                      </form>
                    ) : null}
                    <Button asChild variant={esMia ? "default" : "outline"} className="h-11 flex-1">
                      <Link href={`/auditoria/solicitudes/${solicitud.id}`}>
                        {esMia ? "Continuar" : "Ver detalle"}
                        <ArrowUpRight strokeWidth={1.5} aria-hidden />
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </PanelPage>
  );
}
