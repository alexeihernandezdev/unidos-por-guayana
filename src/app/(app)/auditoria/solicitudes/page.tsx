import Link from "next/link";
import {
  ArrowUpRight,
  Gavel,
  Inbox,
  MapPin,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import {
  EstadoVerificacionSolicitud,
  TipoEventoAuditoriaSolicitud,
  type SolicitudAuditable,
} from "@/modules/auditoria/domain";
import {
  EstadoVerificacionBadge,
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
import { cn } from "@/shared/lib/utils";
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

// Pestañas automáticas de la cola de auditoría (feature 035). Clasifican cada
// solicitud ABIERTA por su relación con el auditor actual: sin tomar, tomada por mí,
// tomada por otro, o ya dictaminada. El auditor ve todo el trabajo en curso y quién
// lo lleva.
const TABS = [
  { key: "cola", label: "En cola", icon: Inbox },
  { key: "mias", label: "En mi revisión", icon: UserCheck },
  { key: "otros", label: "Tomadas por otros", icon: Users },
  { key: "dictamen", label: "Con dictamen", icon: Gavel },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const FECHA = new Intl.DateTimeFormat("es-VE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

type Props = {
  searchParams: Promise<{ q?: string; urgencia?: string; tab?: string }>;
};

function clasificar(item: SolicitudAuditable, actorId: string): TabKey {
  switch (item.estadoVerificacion) {
    case EstadoVerificacionSolicitud.PENDIENTE:
      return "cola";
    case EstadoVerificacionSolicitud.EN_REVISION:
      return item.auditorActualId === actorId ? "mias" : "otros";
    default:
      // VERIFICADA · NO_VERIFICADA · REQUIERE_INFORMACION
      return "dictamen";
  }
}

// Quién tiene o dictaminó la solicitud: en revisión es el auditor actual; ya
// dictaminada, el autor del último DICTAMEN (los eventos llegan del más reciente al
// más antiguo). Devuelve null en la cola (nadie la ha tomado).
function responsable(
  item: SolicitudAuditable,
  actorId: string,
): { nombre: string; esMio: boolean } | null {
  if (
    item.estadoVerificacion === EstadoVerificacionSolicitud.EN_REVISION &&
    item.auditorActualNombre
  ) {
    return {
      nombre: item.auditorActualNombre,
      esMio: item.auditorActualId === actorId,
    };
  }
  const dictamen = item.eventos.find(
    (evento) => evento.tipo === TipoEventoAuditoriaSolicitud.DICTAMEN,
  );
  if (dictamen) {
    return { nombre: dictamen.actorNombre, esMio: dictamen.actorId === actorId };
  }
  return null;
}

function coincideTexto(item: SolicitudAuditable, texto: string): boolean {
  const aguja = texto.toLowerCase();
  return [
    item.sector,
    item.estadoNombre,
    item.municipioNombre,
    item.descripcion,
    item.solicitante.nombre,
  ].some((campo) => campo.toLowerCase().includes(aguja));
}

export default async function AuditoriaSolicitudesPage({ searchParams }: Props) {
  const actor = await requireAuditorActivo();
  const query = await searchParams;

  const tab: TabKey =
    TABS.find((t) => t.key === query.tab)?.key ?? "cola";
  const texto = query.q?.trim() ?? "";
  const urgencia =
    query.urgencia && esUrgenciaSolicitud(query.urgencia)
      ? query.urgencia
      : undefined;

  const todas = await listarAuditoriaServicio(actor);

  // Conteo por pestaña sobre el total (sin aplicar búsqueda/urgencia) para que el
  // número del pill refleje toda la carga real de esa categoría.
  const conteo: Record<TabKey, number> = {
    cola: 0,
    mias: 0,
    otros: 0,
    dictamen: 0,
  };
  for (const item of todas) conteo[clasificar(item, actor.id)] += 1;

  // Visibles: las del tab activo, afinadas por búsqueda y urgencia.
  let visibles = todas.filter((item) => clasificar(item, actor.id) === tab);
  if (urgencia) visibles = visibles.filter((item) => item.urgencia === urgencia);
  if (texto) visibles = visibles.filter((item) => coincideTexto(item, texto));

  const hrefTab = (destino: TabKey) => {
    const params = new URLSearchParams();
    params.set("tab", destino);
    if (texto) params.set("q", texto);
    if (urgencia) params.set("urgencia", urgencia);
    return `/auditoria/solicitudes?${params.toString()}`;
  };

  const filtrosActivos = [texto, urgencia].filter(Boolean).length;

  return (
    <PanelPage>
      <PanelPageHeader
        icon={ShieldCheck}
        eyebrow="Validación externa"
        title="Auditoría de solicitudes"
        description="Comprueba que cada petición sea real antes de habilitar su atención."
      />

      <nav
        aria-label="Filtrar la cola por estado de la revisión"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {TABS.map(({ key, label, icon: Icon }) => {
          const activo = key === tab;
          return (
            <Link
              key={key}
              href={hrefTab(key)}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                activo
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-4" strokeWidth={1.5} aria-hidden />
              {label}
              <span
                className={cn(
                  "min-w-5 rounded-full px-1.5 text-center font-mono text-xs numeric-tnum",
                  activo
                    ? "bg-primary-foreground/20"
                    : "bg-muted text-foreground",
                )}
              >
                {conteo[key]}
              </span>
            </Link>
          );
        })}
      </nav>

      <PanelFilters activos={filtrosActivos} limpiarHref={hrefTab(tab)}>
        <input type="hidden" name="tab" value={tab} />
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
              defaultValue={texto}
              placeholder="Sector, municipio, estado o solicitante"
              className="w-full pl-9 sm:w-80"
            />
          </div>
        </PanelFiltersField>
        <PanelFiltersField label="Urgencia">
          <FiltroSelect
            name="urgencia"
            ariaLabel="Filtrar por urgencia"
            defaultValue={urgencia ?? "todas"}
            opciones={[
              { value: "todas", label: "Todas" },
              ...URGENCIAS_SOLICITUD.map((u) => ({
                value: u,
                label: URGENCIA_LABEL[u],
              })),
            ]}
          />
        </PanelFiltersField>
      </PanelFilters>

      {visibles.length === 0 ? (
        <PanelEmptyState
          icon={Inbox}
          title="No hay solicitudes"
          description="Ninguna solicitud de esta categoría coincide con los filtros."
        />
      ) : (
        <section aria-labelledby="cola-auditoria" className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2
                id="cola-auditoria"
                className="text-xl font-semibold tracking-tight"
              >
                {TABS.find((t) => t.key === tab)?.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {tab === "cola"
                  ? "Toma una solicitud para reservarla durante tu comprobación."
                  : "Consulta el estado de la revisión y quién la lleva."}
              </p>
            </div>
            <span className="font-mono text-xs text-muted-foreground numeric-tnum">
              {visibles.length} resultados
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibles.map((solicitud, indice) => {
              const quien = responsable(solicitud, actor.id);
              const esMia = quien?.esMio ?? false;
              return (
                <article
                  key={solicitud.id}
                  className="audit-card group flex min-w-0 flex-col rounded-xl border border-border/70 bg-card p-5 shadow-sm"
                  style={
                    { "--audit-index": Math.min(indice, 8) } as React.CSSProperties
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary-ink">
                        <MapPin className="size-5" strokeWidth={1.5} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {solicitud.municipioNombre}, {solicitud.estadoNombre}
                        </p>
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
                    <EstadoVerificacionBadge
                      estado={solicitud.estadoVerificacion}
                    />
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

                  {quien ? (
                    <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UserCheck
                        className="size-3.5 text-primary-ink"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      {esMia ? (
                        <span className="font-medium text-foreground">
                          Tomada por ti
                        </span>
                      ) : (
                        <span>
                          Tomada por{" "}
                          <span className="font-medium text-foreground">
                            {quien.nombre}
                          </span>
                        </span>
                      )}
                    </p>
                  ) : null}

                  <div className="mt-5 flex gap-2">
                    {solicitud.estadoVerificacion ===
                    EstadoVerificacionSolicitud.PENDIENTE ? (
                      <form action={tomarSolicitudAction} className="flex-1">
                        <input
                          type="hidden"
                          name="solicitudId"
                          value={solicitud.id}
                        />
                        <BotonAccionAuditoria
                          pendingLabel="Tomando"
                          className="h-11 w-full"
                        >
                          Tomar solicitud
                        </BotonAccionAuditoria>
                      </form>
                    ) : null}
                    <Button
                      asChild
                      variant={esMia ? "default" : "outline"}
                      className="h-11 flex-1"
                    >
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
