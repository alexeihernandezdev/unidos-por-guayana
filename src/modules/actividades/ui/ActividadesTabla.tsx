"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  HeartPulse,
  ImageIcon,
  MapPin,
  Pencil,
  Target,
  Trash2,
  Truck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from "motion/react";
import type { Actividad } from "@/modules/actividades/domain/Actividad";
import type { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import {
  esEditable,
  esEliminable,
} from "@/modules/actividades/domain/maquinaEstados";
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
import { EstadoBadge } from "./EstadoBadge";
import { TipoBadge } from "./TipoBadge";
import { formatearFecha } from "./fechas";
import { etiquetaTipo } from "./tipos";

type Props = {
  actividades: Actividad[];
  eliminarAction: (formData: FormData) => Promise<void>;
};

const TAMANO_PAGINA = 12;
const FORMATO_CANTIDAD = new Intl.NumberFormat("es-VE", {
  maximumFractionDigits: 2,
});

const ICONO_TIPO: Record<TipoActividad, LucideIcon> = {
  ENVIO: Truck,
  JORNADA: HeartPulse,
  EVENTO_SOCIAL: UsersRound,
};

const FONDO_TIPO: Record<TipoActividad, string> = {
  ENVIO: "bg-primary-ink text-primary-foreground",
  JORNADA: "bg-accent text-accent-foreground",
  EVENTO_SOCIAL: "bg-foreground text-background",
};

type PlaceholderProps = {
  actividad: Actividad;
  amplio?: boolean;
};

function ImagenPlaceholder({ actividad, amplio = false }: PlaceholderProps) {
  const Icono = ICONO_TIPO[actividad.tipo];

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden",
        amplio ? "aspect-[16/7]" : "aspect-[16/8]",
        FONDO_TIPO[actividad.tipo],
      )}
      aria-label={`Espacio reservado para imagen de ${actividad.titulo}`}
      role="img"
    >
      <div
        aria-hidden="true"
        className="absolute -right-10 -top-14 size-44 rounded-full border border-current opacity-10 sm:size-56"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-20 -left-10 size-52 rounded-full border border-current opacity-10"
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-15 transition-transform duration-300 ease-out group-hover:scale-110 motion-reduce:transform-none">
        <Icono className={amplio ? "size-28" : "size-16"} strokeWidth={1} />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-3.5 sm:p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-current/75">
          <ImageIcon className="size-4" strokeWidth={1.5} aria-hidden />
          <span>Imagen de actividad</span>
        </div>
        <span className="font-mono text-[0.65rem] tracking-[0.16em] text-current/55 uppercase">
          Placeholder
        </span>
      </div>
    </div>
  );
}

type CardProps = {
  actividad: Actividad;
  indice: number;
  reducirMovimiento: boolean;
  eliminarAction: Props["eliminarAction"];
  abrirPreview: (actividad: Actividad) => void;
};

function ActividadCard({
  actividad,
  indice,
  reducirMovimiento,
  eliminarAction,
  abrirPreview,
}: CardProps) {
  const href = `/panel/actividades/${actividad.id}`;

  return (
    <m.article
      layout={!reducirMovimiento}
      initial={
        reducirMovimiento ? false : { opacity: 0, y: 28, scale: 0.97 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reducirMovimiento ? undefined : { opacity: 0, y: -12, scale: 0.98 }}
      whileHover={reducirMovimiento ? undefined : { y: -7, scale: 1.01 }}
      whileTap={reducirMovimiento ? undefined : { scale: 0.985 }}
      transition={{
        duration: 0.34,
        delay: reducirMovimiento ? 0 : Math.min(indice, 8) * 0.045,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm will-change-transform hover:border-primary/30 hover:shadow-lg"
    >
      <div className="relative overflow-hidden">
        <ImagenPlaceholder actividad={actividad} />
        <div className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
          <TipoBadge
            tipo={actividad.tipo}
            className="border-white/25 bg-background/90 text-foreground shadow-sm backdrop-blur-sm"
          />
          <EstadoBadge
            estado={actividad.estado}
            className="bg-background/90 shadow-sm backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1 text-[0.68rem] font-medium tracking-[0.12em] text-muted-foreground uppercase">
              {etiquetaTipo(actividad.tipo)}
            </p>
            <h2 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground">
              {actividad.titulo}
            </h2>
          </div>
          <ArrowUpRight
            className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-ink motion-reduce:transform-none"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-border/70 pt-3 text-sm">
          <div className="col-span-2 flex min-w-0 items-center gap-2 text-muted-foreground">
            <MapPin className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
            <span className="truncate">{actividad.sectorDestino}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
            <span className="font-mono text-xs numeric-tnum">
              {formatearFecha(actividad.fecha)}
            </span>
          </div>
          <div className="flex items-center justify-end gap-2 text-muted-foreground">
            <Target className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
            <span className="font-mono text-xs numeric-tnum">
              {actividad.metas.length} {actividad.metas.length === 1 ? "meta" : "metas"}
            </span>
          </div>
        </div>

        <div className="relative z-20 mt-auto flex items-center gap-2 pt-4">
          {esEditable(actividad.estado) ? (
            <Button
              asChild
              variant="outline"
              className="h-11 flex-1 bg-background/80"
            >
              <Link href={`${href}/editar`}>
                <Pencil strokeWidth={1.5} aria-hidden />
                Editar
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="h-11 flex-1 bg-background/80">
              <Link href={href}>
                <ArrowUpRight strokeWidth={1.5} aria-hidden />
                Ver detalle
              </Link>
            </Button>
          )}

          {esEliminable(actividad.estado) ? (
            <form
              action={eliminarAction}
              onSubmit={(evento) => {
                if (!window.confirm(`¿Eliminar “${actividad.titulo}”?`)) {
                  evento.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={actividad.id} />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="size-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Eliminar ${actividad.titulo}`}
              >
                <Trash2 strokeWidth={1.5} aria-hidden />
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        className="absolute inset-0 z-10 cursor-pointer rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:ring-inset"
        onClick={() => abrirPreview(actividad)}
        aria-label={`Abrir vista previa de ${actividad.titulo}`}
        aria-haspopup="dialog"
      />
    </m.article>
  );
}

type PreviewProps = {
  actividad: Actividad | null;
  cerrar: () => void;
  reducirMovimiento: boolean;
};

function ActividadPreview({
  actividad,
  cerrar,
  reducirMovimiento,
}: PreviewProps) {
  return (
    <Dialog open={actividad !== null} onOpenChange={(open) => (!open ? cerrar() : null)}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[92dvh] gap-0 overflow-y-auto rounded-2xl border-border/70 p-0 sm:max-w-2xl"
      >
        {actividad ? (
          <m.div
            initial={
              reducirMovimiento ? false : { opacity: 0, y: 16, scale: 0.985 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.28,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="group relative">
              <ImagenPlaceholder actividad={actividad} amplio />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2 sm:left-6 sm:top-6">
                <TipoBadge
                  tipo={actividad.tipo}
                  className="border-white/25 bg-background/90 text-foreground shadow-sm backdrop-blur-sm"
                />
                <EstadoBadge
                  estado={actividad.estado}
                  className="bg-background/90 shadow-sm backdrop-blur-sm"
                />
              </div>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute right-4 top-4 h-11 border-white/25 bg-background/90 px-4 shadow-sm backdrop-blur-sm sm:right-6 sm:top-6"
                >
                  Cerrar
                </Button>
              </DialogClose>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              <DialogHeader className="pr-0 text-left">
                <DialogTitle className="text-2xl leading-tight tracking-tight sm:text-3xl">
                  {actividad.titulo}
                </DialogTitle>
                <DialogDescription className="max-w-xl text-sm leading-6">
                  {actividad.descripcion ??
                    "Consulta los datos principales de esta actividad y abre el detalle para gestionarla."}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-muted/35 p-4">
                  <MapPin className="mb-3 size-5 text-primary-ink" strokeWidth={1.5} aria-hidden />
                  <p className="text-xs text-muted-foreground">Destino</p>
                  <p className="mt-1 text-sm font-medium">{actividad.sectorDestino}</p>
                </div>
                <div className="rounded-xl border bg-muted/35 p-4">
                  <CalendarDays className="mb-3 size-5 text-primary-ink" strokeWidth={1.5} aria-hidden />
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="mt-1 font-mono text-sm font-medium numeric-tnum">
                    {formatearFecha(actividad.fecha)}
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/35 p-4">
                  <Target className="mb-3 size-5 text-primary-ink" strokeWidth={1.5} aria-hidden />
                  <p className="text-xs text-muted-foreground">Metas</p>
                  <p className="mt-1 font-mono text-sm font-medium numeric-tnum">
                    {actividad.metas.length}
                  </p>
                </div>
              </div>

              <section aria-labelledby="preview-metas">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h3 id="preview-metas" className="text-sm font-semibold">
                    Recursos previstos
                  </h3>
                  {actividad.metas.length > 4 ? (
                    <span className="font-mono text-xs text-muted-foreground numeric-tnum">
                      +{actividad.metas.length - 4} más
                    </span>
                  ) : null}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {actividad.metas.slice(0, 4).map((meta) => (
                    <div
                      key={meta.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-3"
                    >
                      <span className="min-w-0 truncate text-sm">
                        {meta.recurso?.nombre ?? "Recurso"}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground numeric-tnum">
                        {FORMATO_CANTIDAD.format(meta.cantidadObjetivo)} {meta.recurso?.unidad ?? ""}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <DialogFooter className="border-t border-border/70 pt-5 sm:items-center sm:justify-between">
                <p className="text-left text-xs text-muted-foreground">
                  Vista rápida. La gestión completa permanece en el detalle.
                </p>
                <Button asChild className="h-11">
                  <Link href={`/panel/actividades/${actividad.id}`}>
                    Ver detalle completo
                    <ArrowUpRight strokeWidth={1.5} aria-hidden />
                  </Link>
                </Button>
              </DialogFooter>
            </div>
          </m.div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function ActividadesTabla({ actividades, eliminarAction }: Props) {
  const [cantidadVisible, setCantidadVisible] = useState(TAMANO_PAGINA);
  const [actividadPreview, setActividadPreview] = useState<Actividad | null>(null);
  const reducirMovimiento = useReducedMotion() === true;

  if (actividades.length === 0) {
    return (
      <PanelEmptyState
        bordered={false}
        icon={Truck}
        title="Sin actividades"
        description="No hay actividades que coincidan con el filtro. Crea una nueva o ajusta los filtros."
        action={
          <Button asChild variant="outline" className="h-11">
            <Link href="/panel/actividades/nueva">Nueva actividad</Link>
          </Button>
        }
      />
    );
  }

  const actividadesVisibles = actividades.slice(0, cantidadVisible);
  const faltantes = actividades.length - actividadesVisibles.length;
  const siguienteBloque = Math.min(TAMANO_PAGINA, faltantes);

  return (
    <LazyMotion features={domAnimation} strict>
      <section aria-labelledby="titulo-grid-actividades" className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
              Operación activa
            </p>
            <h2 id="titulo-grid-actividades" className="mt-1 text-xl font-semibold tracking-tight">
              Todas las actividades
            </h2>
          </div>
          <p className="font-mono text-xs text-muted-foreground numeric-tnum">
            {actividadesVisibles.length} de {actividades.length}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          <AnimatePresence initial>
            {actividadesVisibles.map((actividad, indice) => (
              <ActividadCard
                key={actividad.id}
                actividad={actividad}
                indice={indice}
                reducirMovimiento={reducirMovimiento}
                eliminarAction={eliminarAction}
                abrirPreview={setActividadPreview}
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
              Quedan {faltantes} {faltantes === 1 ? "actividad" : "actividades"}
            </p>
          </div>
        ) : null}
      </section>

      <ActividadPreview
        actividad={actividadPreview}
        cerrar={() => setActividadPreview(null)}
        reducirMovimiento={reducirMovimiento}
      />
    </LazyMotion>
  );
}
