import { notFound } from "next/navigation";
import {
  CalendarDays,
  Hash,
  Mail,
  MapPin,
  Package,
  Phone,
  UserRound,
} from "lucide-react";
import { SolicitudAuditoriaNoEncontradaError } from "@/modules/auditoria/application";
import {
  EstadoVerificacionSolicitud,
  TipoEventoAuditoriaSolicitud,
} from "@/modules/auditoria/domain";
import {
  EstadoVerificacionBadge,
  EvidenciaAuditoria,
  EvidenciaAuditoriaVista,
  FormularioDictamenAuditoria,
  BotonAccionAuditoria,
} from "@/modules/auditoria/ui";
import { UrgenciaBadge } from "@/modules/solicitudes/ui/UrgenciaBadge";
import {
  cargarEvidenciasVistaServicio,
  obtenerAuditoriaServicio,
} from "@/shared/auditoria";
import { requireAuditorActivo } from "@/shared/auth";
import {
  PanelList,
  PanelListRow,
  PanelPage,
  PanelPageSubHeader,
} from "@/shared/ui/panel";
import {
  emitirDictamenAction,
  liberarSolicitudAction,
  tomarSolicitudAction,
} from "../actions";

type Props = { params: Promise<{ id: string }> };

const FECHA = new Intl.DateTimeFormat("es-VE", {
  dateStyle: "medium",
  timeStyle: "short",
});

const EVENTO_LABEL = {
  [TipoEventoAuditoriaSolicitud.CREADA]: "Solicitud incorporada a la cola",
  [TipoEventoAuditoriaSolicitud.TOMADA]: "Revisión iniciada",
  [TipoEventoAuditoriaSolicitud.LIBERADA]: "Solicitud devuelta a la cola",
  [TipoEventoAuditoriaSolicitud.DICTAMEN]: "Dictamen emitido",
  [TipoEventoAuditoriaSolicitud.REENVIADA]: "Información corregida y reenviada",
};

export default async function AuditoriaSolicitudDetallePage({ params }: Props) {
  const actor = await requireAuditorActivo();
  const { id } = await params;
  let solicitud;
  try {
    solicitud = await obtenerAuditoriaServicio(actor, id);
  } catch (error) {
    if (error instanceof SolicitudAuditoriaNoEncontradaError) notFound();
    throw error;
  }

  const pendiente =
    solicitud.estadoVerificacion === EstadoVerificacionSolicitud.PENDIENTE;
  const enRevisionPropia =
    solicitud.estadoVerificacion === EstadoVerificacionSolicitud.EN_REVISION &&
    solicitud.auditorActualId === actor.id;

  const evidencia = await cargarEvidenciasVistaServicio(solicitud.id);

  return (
    <PanelPage>
      <PanelPageSubHeader
        title={solicitud.sector}
        backHref="/auditoria/solicitudes"
        backLabel="Volver a la cola"
        actions={
          pendiente ? (
            <form action={tomarSolicitudAction}>
              <input type="hidden" name="solicitudId" value={solicitud.id} />
              <BotonAccionAuditoria
                pendingLabel="Tomando"
                className="h-11"
                icon
              >
                Tomar solicitud
              </BotonAccionAuditoria>
            </form>
          ) : enRevisionPropia ? (
            <form action={liberarSolicitudAction}>
              <input type="hidden" name="solicitudId" value={solicitud.id} />
              <BotonAccionAuditoria
                pendingLabel="Liberando"
                variant="outline"
                className="h-11"
              >
                Liberar revisión
              </BotonAccionAuditoria>
            </form>
          ) : undefined
        }
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.6fr)]">
        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <EstadoVerificacionBadge estado={solicitud.estadoVerificacion} />
            <UrgenciaBadge urgencia={solicitud.urgencia} />
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              Ciclo {solicitud.cicloAuditoria}
            </span>
          </div>
          <div className="mt-5 flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary-ink" strokeWidth={1.5} aria-hidden />
            <div>
              <p className="text-xs text-muted-foreground">Sector reportado</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">{solicitud.sector}</h1>
            </div>
          </div>
          <p className="mt-5 max-w-[70ch] text-sm leading-6 text-foreground/80">
            {solicitud.descripcion}
          </p>
          <p className="mt-5 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground numeric-tnum">
            <CalendarDays className="size-4" strokeWidth={1.5} aria-hidden />
            Recibida {FECHA.format(solicitud.createdAt)}
          </p>
        </div>

        <aside className="rounded-xl border border-border/70 bg-muted/25 p-5">
          <div className="flex items-center gap-2">
            <UserRound className="size-5 text-primary-ink" strokeWidth={1.5} aria-hidden />
            <h2 className="font-semibold">Contacto del solicitante</h2>
          </div>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Nombre</dt>
              <dd className="mt-1 font-medium">{solicitud.solicitante.nombre}</dd>
            </div>
            <div>
              <dt className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="size-3.5" strokeWidth={1.5} aria-hidden /> Correo
              </dt>
              <dd className="mt-1 break-all">{solicitud.solicitante.email}</dd>
            </div>
            <div>
              <dt className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="size-3.5" strokeWidth={1.5} aria-hidden /> Teléfono
              </dt>
              <dd className="mt-1">{solicitud.solicitante.telefono ?? "No registrado"}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="space-y-3 border-t border-border pt-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Recursos solicitados</h2>
          <span className="font-mono text-xs text-muted-foreground numeric-tnum">
            {solicitud.recursos.length} en total
          </span>
        </div>
        <PanelList>
          {solicitud.recursos.map((recurso) => (
            <PanelListRow
              key={recurso.id}
              icon={Package}
              title={recurso.nombre}
              meta={[
                {
                  icon: Hash,
                  label: "Cantidad estimada",
                  texto:
                    recurso.cantidadEstimada == null
                      ? "No definida"
                      : `${recurso.cantidadEstimada} ${recurso.unidad}`,
                },
              ]}
            />
          ))}
        </PanelList>
      </section>

      {enRevisionPropia ? (
        <section className="rounded-xl border border-primary/25 bg-primary/[0.035] p-5 sm:p-6">
          <div className="mb-5">
            <p className="text-xs font-medium text-primary-ink">Revisión reservada para ti</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Registrar dictamen</h2>
            <p className="mt-1 max-w-[65ch] text-sm text-muted-foreground">
              Documenta la comprobación externa. Una vez emitido, el registro no podrá editarse.
            </p>
          </div>
          <div className="mb-6 border-b border-border/70 pb-6">
            <EvidenciaAuditoria
              solicitudId={solicitud.id}
              evidenciasIniciales={evidencia.evidencias}
            />
          </div>
          <FormularioDictamenAuditoria
            solicitudId={solicitud.id}
            action={emitirDictamenAction}
          />
        </section>
      ) : solicitud.estadoVerificacion === EstadoVerificacionSolicitud.EN_REVISION ? (
        <p className="rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          {solicitud.auditorActualNombre} está revisando esta solicitud. Puedes consultar el historial, pero no emitir un dictamen.
        </p>
      ) : null}

      {!enRevisionPropia ? (
        <EvidenciaAuditoriaVista
          evidencias={evidencia.evidencias}
          error={evidencia.error}
        />
      ) : null}

      <section className="space-y-4 border-t border-border pt-6">
        <div>
          <h2 className="text-lg font-semibold">Historial de auditoría</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Bitácora interna e inmutable de todas las revisiones.
          </p>
        </div>
        <ol className="relative ml-2 space-y-5 border-l border-border pl-6">
          {solicitud.eventos.map((evento) => (
            <li key={evento.id} className="relative">
              <span className="absolute -left-[1.78rem] top-1.5 size-3 rounded-full border-2 border-background bg-primary" aria-hidden />
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold">{EVENTO_LABEL[evento.tipo]}</h3>
                <EstadoVerificacionBadge estado={evento.estadoResultante} />
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground numeric-tnum">
                {FECHA.format(evento.createdAt)} · {evento.actorNombre} · ciclo {evento.ciclo}
              </p>
              {evento.metodo ? (
                <p className="mt-3 text-sm"><span className="font-medium">Método:</span> {evento.metodo}</p>
              ) : null}
              {evento.notaInterna ? (
                <div className="mt-2 rounded-lg border border-border/70 bg-muted/30 p-3 text-sm leading-5">
                  <p className="text-xs font-medium text-muted-foreground">Nota interna</p>
                  <p className="mt-1 whitespace-pre-wrap">{evento.notaInterna}</p>
                </div>
              ) : null}
              {evento.explicacionPublica ? (
                <div className="mt-2 rounded-lg border border-border/70 p-3 text-sm leading-5">
                  <p className="text-xs font-medium text-muted-foreground">Mensaje al solicitante</p>
                  <p className="mt-1 whitespace-pre-wrap">{evento.explicacionPublica}</p>
                </div>
              ) : null}
              {evento.referenciaExterna ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Referencia externa: {evento.referenciaExterna}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </PanelPage>
  );
}
