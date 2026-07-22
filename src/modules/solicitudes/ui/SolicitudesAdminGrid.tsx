"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  ImageIcon,
  MapPin,
  Minus,
  Package,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from "motion/react";
import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { PanelEmptyState } from "@/shared/ui/panel";
import { EstadoSolicitudBadge } from "./EstadoSolicitudBadge";
import { PortadaImagen } from "./PortadaImagen";
import { SolicitudAcciones } from "./SolicitudAcciones";
import { UrgenciaBadge } from "./UrgenciaBadge";
import { formatearFechaCreacion } from "./fechas";
import { URGENCIA_LABEL } from "./urgencias";
import { EstadoVerificacionBadge } from "@/modules/auditoria/ui/EstadoVerificacionBadge";

type AccionSolicitud = (formData: FormData) => Promise<void>;

type Props = {
  solicitudes: Solicitud[];
  baseRuta: string;
  /** solicitudId → URL firmada de la imagen principal (portada). */
  portadas: Map<string, string>;
  marcarAtendidaAction: AccionSolicitud;
  cerrarAction: AccionSolicitud;
};

const TAMANO_PAGINA = 12;
const FORMATO_CANTIDAD = new Intl.NumberFormat("es-VE", {
  maximumFractionDigits: 2,
});

const ICONO_URGENCIA: Record<UrgenciaSolicitud, LucideIcon> = {
  [UrgenciaSolicitud.BAJA]: Minus,
  [UrgenciaSolicitud.MEDIA]: Clock3,
  [UrgenciaSolicitud.ALTA]: TriangleAlert,
};

const SENAL_URGENCIA: Record<UrgenciaSolicitud, string> = {
  [UrgenciaSolicitud.BAJA]: "bg-muted-foreground/45",
  [UrgenciaSolicitud.MEDIA]: "bg-warning",
  [UrgenciaSolicitud.ALTA]: "bg-destructive",
};

const ICONO_FONDO_URGENCIA: Record<UrgenciaSolicitud, string> = {
  [UrgenciaSolicitud.BAJA]: "bg-muted text-foreground/70",
  [UrgenciaSolicitud.MEDIA]: "bg-warning/15 text-warning-ink",
  [UrgenciaSolicitud.ALTA]: "bg-destructive/10 text-destructive",
};

function etiquetaCantidad(solicitud: Solicitud, indice: number) {
  const item = solicitud.recursos[indice];
  if (!item || item.cantidadEstimada == null) return null;

  return `${FORMATO_CANTIDAD.format(item.cantidadEstimada)} ${item.recurso?.unidad ?? ""}`.trim();
}

type CardProps = {
  solicitud: Solicitud;
  indice: number;
  reducirMovimiento: boolean;
  portada?: string;
  abrirPreview: (id: string) => void;
};

function SolicitudCard({
  solicitud,
  indice,
  reducirMovimiento,
  portada,
  abrirPreview,
}: CardProps) {
  const IconoUrgencia = ICONO_URGENCIA[solicitud.urgencia];
  const recursosVisibles = solicitud.recursos.slice(0, 3);
  const recursosRestantes = solicitud.recursos.length - recursosVisibles.length;

  return (
    <m.article
      layout={!reducirMovimiento}
      initial={reducirMovimiento ? false : { opacity: 0, y: 64, scale: 0.9 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.55,
          delay: reducirMovimiento ? 0 : Math.min(indice % TAMANO_PAGINA, 10) * 0.07,
          ease: [0.23, 1, 0.32, 1],
        },
      }}
      exit={
        reducirMovimiento
          ? undefined
          : {
              opacity: 0,
              y: -16,
              scale: 0.96,
              transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] },
            }
      }
      whileHover={
        reducirMovimiento
          ? undefined
          : {
              y: -7,
              scale: 1.012,
              transition: { duration: 0.2, delay: 0, ease: [0.23, 1, 0.32, 1] },
            }
      }
      whileTap={
        reducirMovimiento
          ? undefined
          : {
              scale: 0.985,
              transition: { duration: 0.12, delay: 0, ease: [0.23, 1, 0.32, 1] },
            }
      }
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm will-change-transform hover:border-primary/30 hover:shadow-md"
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 z-20 w-1",
          SENAL_URGENCIA[solicitud.urgencia],
        )}
      />

      {/* Portada compacta (banner). Feature 033: imagen principal de la solicitud. */}
      <div className="relative h-36 shrink-0 overflow-hidden bg-muted">
        {portada ? (
          <PortadaImagen
            src={portada}
            alt={`Imagen de la solicitud de ${solicitud.sector}`}
            sizes="(min-width: 1536px) 22vw, (min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-muted text-muted-foreground">
            <ImageIcon strokeWidth={1.5} className="size-6 opacity-70" aria-hidden />
          </div>
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/60 to-transparent"
        />
      </div>

      <div className="flex flex-1 flex-col p-4 pl-5 sm:p-5 sm:pl-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary-ink">
              <MapPin className="size-5" strokeWidth={1.5} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Sector</p>
              <h2 className="mt-0.5 line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-foreground">
                {solicitud.sector}
              </h2>
            </div>
          </div>
          <ArrowUpRight
            className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-ink motion-reduce:transform-none"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <span
              className={cn(
                "grid size-7 place-items-center rounded-md",
                ICONO_FONDO_URGENCIA[solicitud.urgencia],
              )}
            >
              <IconoUrgencia className="size-4" strokeWidth={1.5} aria-hidden />
            </span>
            Urgencia {URGENCIA_LABEL[solicitud.urgencia].toLowerCase()}
          </span>
          <EstadoSolicitudBadge estado={solicitud.estado} />
          <EstadoVerificacionBadge estado={solicitud.estadoVerificacion} />
        </div>

        <p className="mt-4 line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-foreground/80 [text-wrap:pretty]">
          {solicitud.descripcion}
        </p>

        <div className="mt-5 border-t border-border/70 pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
              <Package className="size-4 text-primary-ink" strokeWidth={1.5} aria-hidden />
              Recursos solicitados
            </span>
            <span className="font-mono text-xs text-muted-foreground numeric-tnum">
              {solicitud.recursos.length}
            </span>
          </div>

          {recursosVisibles.length > 0 ? (
            <ul className="space-y-2" aria-label="Resumen de recursos solicitados">
              {recursosVisibles.map((item, itemIndice) => {
                const cantidad = etiquetaCantidad(solicitud, itemIndice);
                return (
                  <li
                    key={item.id}
                    className="flex min-w-0 items-center justify-between gap-3 text-xs"
                  >
                    <span className="min-w-0 truncate text-foreground/80">
                      {item.recurso?.nombre ?? "Recurso"}
                    </span>
                    {cantidad ? (
                      <span className="shrink-0 font-mono text-muted-foreground numeric-tnum">
                        {cantidad}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">Sin recursos definidos</p>
          )}

          {recursosRestantes > 0 ? (
            <p className="mt-2 font-mono text-xs text-primary-ink numeric-tnum">
              +{recursosRestantes} {recursosRestantes === 1 ? "recurso más" : "recursos más"}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4" strokeWidth={1.5} aria-hidden />
            <span className="font-mono numeric-tnum">
              {formatearFechaCreacion(solicitud.createdAt)}
            </span>
          </span>
          <span className="font-medium text-primary-ink">Vista rápida</span>
        </div>
      </div>

      <button
        type="button"
        className="absolute inset-0 z-10 cursor-pointer rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:ring-inset"
        onClick={() => abrirPreview(solicitud.id)}
        aria-label={`Abrir vista rápida de la solicitud del sector ${solicitud.sector}`}
        aria-haspopup="dialog"
      />
    </m.article>
  );
}

// Imagen de portada del header del modal: funde sobre la base teal (que hace de
// estado de carga y garantiza legibilidad del texto blanco) con un veil degradado.
function HeroPortada({ src, alt }: { src: string; alt: string }) {
  const [cargada, setCargada] = useState(false);
  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 640px) 42rem, 100vw"
        onLoad={() => setCargada(true)}
        className={cn(
          "object-cover transition-opacity duration-500 ease-[var(--ease-out-emil)]",
          cargada ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-primary-ink/95 via-primary-ink/70 to-primary-ink/45"
      />
    </>
  );
}

type PreviewProps = {
  solicitud: Solicitud | null;
  baseRuta: string;
  portada?: string;
  cerrar: () => void;
  marcarAtendidaAction: AccionSolicitud;
  cerrarAction: AccionSolicitud;
};

function SolicitudPreview({
  solicitud,
  baseRuta,
  portada,
  cerrar,
  marcarAtendidaAction,
  cerrarAction,
}: PreviewProps) {
  return (
    <Dialog open={solicitud !== null} onOpenChange={(open) => (!open ? cerrar() : null)}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[92dvh] gap-0 overflow-y-auto rounded-2xl border-border/70 p-0 sm:max-w-2xl"
      >
        {solicitud ? (
          <>
            <div className="relative overflow-hidden border-b border-border/70 bg-primary-ink px-5 py-6 text-primary-foreground sm:px-7">
              {portada ? (
                <HeroPortada
                  key={solicitud.id}
                  src={portada}
                  alt={`Imagen de la solicitud de ${solicitud.sector}`}
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="absolute -right-14 -top-16 size-48 rounded-full border border-white/10"
                />
              )}
              <DialogHeader className="relative z-10 pr-14 text-left">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <UrgenciaBadge
                    urgencia={solicitud.urgencia}
                    className="border-white/20 bg-white/10 text-white"
                  />
                  <EstadoSolicitudBadge
                    estado={solicitud.estado}
                    className="border-white/20 bg-white/10 text-white"
                  />
                  <EstadoVerificacionBadge
                    estado={solicitud.estadoVerificacion}
                    className="border border-white/20 bg-white/10 text-white"
                  />
                </div>
                <DialogTitle className="flex items-start gap-3 text-2xl leading-tight tracking-tight sm:text-3xl">
                  <MapPin className="mt-1 size-6 shrink-0" strokeWidth={1.5} aria-hidden />
                  <span>{solicitud.sector}</span>
                </DialogTitle>
                <DialogDescription className="font-mono text-xs text-white/70 numeric-tnum">
                  Recibida el {formatearFechaCreacion(solicitud.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute right-5 top-5 z-10 size-11 border-white/20 bg-white/10 text-white shadow-none hover:bg-white/20 hover:text-white sm:right-7"
                  aria-label="Cerrar vista rápida"
                >
                  <X strokeWidth={1.5} aria-hidden />
                </Button>
              </DialogClose>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              <section aria-labelledby="solicitud-descripcion">
                <h3 id="solicitud-descripcion" className="text-sm font-semibold text-foreground">
                  Necesidad reportada
                </h3>
                <p className="mt-2 max-w-[65ch] text-sm leading-6 text-foreground/80 [text-wrap:pretty]">
                  {solicitud.descripcion}
                </p>
              </section>

              <section aria-labelledby="solicitud-recursos">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h3 id="solicitud-recursos" className="text-sm font-semibold text-foreground">
                    Manifiesto de recursos
                  </h3>
                  <span className="font-mono text-xs text-muted-foreground numeric-tnum">
                    {solicitud.recursos.length} en total
                  </span>
                </div>

                {solicitud.recursos.length > 0 ? (
                  <div className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70">
                    {solicitud.recursos.map((item) => (
                      <div
                        key={item.id}
                        className="flex min-h-12 items-center justify-between gap-4 px-4 py-3"
                      >
                        <span className="min-w-0 truncate text-sm font-medium text-foreground">
                          {item.recurso?.nombre ?? "Recurso"}
                        </span>
                        <span className="shrink-0 font-mono text-xs text-muted-foreground numeric-tnum">
                          {item.cantidadEstimada == null
                            ? "Cantidad no definida"
                            : `${FORMATO_CANTIDAD.format(item.cantidadEstimada)} ${item.recurso?.unidad ?? ""}`.trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                    Esta solicitud no tiene recursos definidos.
                  </p>
                )}
              </section>

              <section
                aria-labelledby="solicitud-gestion"
                className="rounded-xl border border-border/70 bg-muted/30 p-4"
              >
                <h3 id="solicitud-gestion" className="text-sm font-semibold text-foreground">
                  Gestión de la solicitud
                </h3>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Marca la petición como atendida cuando esté cubierta, o ciérrala si ya no aplica.
                </p>
                <div className="mt-4">
                  <SolicitudAcciones
                    solicitudId={solicitud.id}
                    estado={solicitud.estado}
                    estadoVerificacion={solicitud.estadoVerificacion}
                    modo="admin"
                    marcarAtendidaAction={marcarAtendidaAction}
                    cerrarAction={cerrarAction}
                  />
                </div>
              </section>

              <DialogFooter className="items-center border-t border-border/70 pt-5 sm:justify-between">
                <p className="text-left text-xs text-muted-foreground">
                  Los cambios de estado son definitivos.
                </p>
                <Button asChild className="h-11">
                  <Link href={`${baseRuta}/${solicitud.id}`}>
                    Ver detalle completo
                    <ArrowUpRight strokeWidth={1.5} aria-hidden />
                  </Link>
                </Button>
              </DialogFooter>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function SolicitudesAdminGrid({
  solicitudes,
  baseRuta,
  portadas,
  marcarAtendidaAction,
  cerrarAction,
}: Props) {
  const [cantidadVisible, setCantidadVisible] = useState(TAMANO_PAGINA);
  const [solicitudPreviewId, setSolicitudPreviewId] = useState<string | null>(null);
  const reducirMovimiento = useReducedMotion() === true;

  if (solicitudes.length === 0) {
    return (
      <PanelEmptyState
        bordered={false}
        icon={Package}
        title="Sin solicitudes"
        description="No hay solicitudes que coincidan con los filtros actuales."
      />
    );
  }

  const solicitudesVisibles = solicitudes.slice(0, cantidadVisible);
  const solicitudPreview =
    solicitudes.find((solicitud) => solicitud.id === solicitudPreviewId) ?? null;
  const portadaPreview = solicitudPreview
    ? portadas.get(solicitudPreview.id)
    : undefined;
  const faltantes = solicitudes.length - solicitudesVisibles.length;
  const siguienteBloque = Math.min(TAMANO_PAGINA, faltantes);

  return (
    <LazyMotion features={domAnimation} strict>
      <section aria-labelledby="titulo-grid-solicitudes" className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="titulo-grid-solicitudes" className="text-xl font-semibold tracking-tight">
              Solicitudes del territorio
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Abre una ficha para revisar la necesidad y gestionar su estado.
            </p>
          </div>
          <p className="font-mono text-xs text-muted-foreground numeric-tnum">
            {solicitudesVisibles.length} de {solicitudes.length}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <AnimatePresence initial>
            {solicitudesVisibles.map((solicitud, indice) => (
              <SolicitudCard
                key={solicitud.id}
                solicitud={solicitud}
                indice={indice}
                reducirMovimiento={reducirMovimiento}
                portada={portadas.get(solicitud.id)}
                abrirPreview={setSolicitudPreviewId}
              />
            ))}
          </AnimatePresence>
        </div>

        {faltantes > 0 ? (
          <div className="flex flex-col items-center gap-3 border-t border-border/70 pt-6">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11 min-w-52 bg-card shadow-xs"
              onClick={() =>
                setCantidadVisible((cantidad) => cantidad + TAMANO_PAGINA)
              }
            >
              Cargar {siguienteBloque} más
              <ChevronDown strokeWidth={1.5} aria-hidden />
            </Button>
            <p className="font-mono text-xs text-muted-foreground numeric-tnum">
              Quedan {faltantes} {faltantes === 1 ? "solicitud" : "solicitudes"}
            </p>
          </div>
        ) : null}
      </section>

      <SolicitudPreview
        solicitud={solicitudPreview}
        baseRuta={baseRuta}
        portada={portadaPreview}
        cerrar={() => setSolicitudPreviewId(null)}
        marcarAtendidaAction={marcarAtendidaAction}
        cerrarAction={cerrarAction}
      />
    </LazyMotion>
  );
}
