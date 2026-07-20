"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Trash2, X } from "lucide-react";
import type { MetaRecurso } from "@/modules/actividades/domain/Actividad";
import type { NecesidadPendiente } from "@/modules/atenciones/domain/Atencion";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { RecursoOpcion } from "./ActividadForm";
import {
  METAS_DROPPABLE_ID,
  MetasDropZone,
} from "./necesidades/MetasDropZone";
import { NecesidadCard } from "./necesidades/NecesidadCard";
import { NecesidadesSidebar } from "./necesidades/NecesidadesSidebar";

type Resultado = { ok: boolean; error?: string };

type Props = {
  actividadId: string;
  metas: MetaRecurso[];
  recursos: RecursoOpcion[];
  // Necesidades pendientes para el sidebar arrastrable (feature 030).
  necesidades: NecesidadPendiente[];
  // Server actions ligadas por la página. `guardar` hace upsert (añadir o cambiar
  // objetivo); `quitar` elimina la meta del recurso indicado.
  guardarAction: (
    actividadId: string,
    input: { recursoId: string; cantidadObjetivo: number },
  ) => Promise<Resultado>;
  quitarAction: (actividadId: string, recursoId: string) => Promise<Resultado>;
  // Atenciones (feature 030): vincular una necesidad crea/reutiliza la meta;
  // desvincular libera la necesidad (vuelve al sidebar).
  vincularAction: (
    actividadId: string,
    recursoSolicitudId: string,
  ) => Promise<Resultado>;
  desvincularAction: (
    actividadId: string,
    atencionId: string,
  ) => Promise<Resultado>;
};

// Editor de metas para una Actividad en RECOLECTANDO: añade, cambia el objetivo o quita
// metas, y (feature 030) permite arrastrar necesidades reales de solicitudes para
// atenderlas. Cada operación va contra el servidor y refresca la vista.
export function MetasEditor({
  actividadId,
  metas,
  recursos,
  necesidades,
  guardarAction,
  quitarAction,
  vincularAction,
  desvincularAction,
}: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [necesidadActiva, setNecesidadActiva] =
    useState<NecesidadPendiente | null>(null);

  // Cantidades editables por recurso (clave = recursoId).
  const [cantidades, setCantidades] = useState<Record<string, number>>(() =>
    Object.fromEntries(metas.map((m) => [m.recursoId, m.cantidadObjetivo])),
  );

  const usados = useMemo(() => new Set(metas.map((m) => m.recursoId)), [metas]);
  const disponibles = useMemo(
    () => recursos.filter((r) => !usados.has(r.id)),
    [recursos, usados],
  );

  const [nuevoRecursoId, setNuevoRecursoId] = useState<string>("");
  const [nuevaCantidad, setNuevaCantidad] = useState<number>(1);

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  function ejecutar(accion: () => Promise<Resultado>) {
    setError(null);
    startTransition(async () => {
      const resultado = await accion();
      if (resultado.ok) {
        router.refresh();
      } else {
        setError(resultado.error ?? "No se pudo actualizar la meta.");
      }
    });
  }

  function onDragStart(event: DragStartEvent) {
    setNecesidadActiva(
      (event.active.data.current?.necesidad as NecesidadPendiente) ?? null,
    );
  }

  function onDragEnd(event: DragEndEvent) {
    const necesidad = event.active.data.current?.necesidad as
      | NecesidadPendiente
      | undefined;
    setNecesidadActiva(null);
    if (event.over?.id === METAS_DROPPABLE_ID && necesidad) {
      ejecutar(() => vincularAction(actividadId, necesidad.recursoSolicitudId));
    }
  }

  return (
    <DndContext
      sensors={sensores}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setNecesidadActiva(null)}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <MetasDropZone activo={Boolean(necesidadActiva)}>
          <div className="flex flex-col gap-4">
            {metas.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
                Esta actividad aún no tiene metas. Añade un recurso o arrastra una
                necesidad desde el panel.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {metas.map((meta) => (
                  <li
                    key={meta.id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {meta.recurso?.nombre ?? "Recurso"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Objetivo en {meta.recurso?.unidad ?? "unidades"}
                        </p>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="numeric-tnum w-32"
                        aria-label={`Objetivo de ${meta.recurso?.nombre ?? "recurso"}`}
                        value={cantidades[meta.recursoId] ?? meta.cantidadObjetivo}
                        onChange={(e) =>
                          setCantidades((prev) => ({
                            ...prev,
                            [meta.recursoId]: e.target.valueAsNumber,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pendiente}
                        onClick={() =>
                          ejecutar(() =>
                            guardarAction(actividadId, {
                              recursoId: meta.recursoId,
                              cantidadObjetivo:
                                cantidades[meta.recursoId] ??
                                meta.cantidadObjetivo,
                            }),
                          )
                        }
                      >
                        Guardar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Quitar meta"
                        title={
                          meta.atenciones.length > 0
                            ? `Se desvincularán ${meta.atenciones.length} necesidad(es)`
                            : undefined
                        }
                        disabled={pendiente}
                        onClick={() =>
                          ejecutar(() => quitarAction(actividadId, meta.recursoId))
                        }
                      >
                        <Trash2 strokeWidth={1.5} />
                      </Button>
                    </div>

                    {meta.atenciones.length > 0 && (
                      <div className="flex flex-col gap-1.5 border-t border-border/60 pt-2.5">
                        <span className="text-[0.6875rem] font-medium text-muted-foreground">
                          Atiende necesidades de:
                        </span>
                        <ul className="flex flex-wrap gap-1.5">
                          {meta.atenciones.map((a) => (
                            <li key={a.atencionId}>
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 py-0.5 pr-1 pl-2.5 text-xs text-foreground/80">
                                <span className="max-w-[16rem] truncate">
                                  {a.solicitanteNombre} · {a.sector}
                                  {a.cantidadEstimada != null && (
                                    <span className="numeric-tnum font-mono text-muted-foreground">
                                      {" "}
                                      ({a.cantidadEstimada})
                                    </span>
                                  )}
                                </span>
                                <button
                                  type="button"
                                  disabled={pendiente}
                                  onClick={() =>
                                    ejecutar(() =>
                                      desvincularAction(actividadId, a.atencionId),
                                    )
                                  }
                                  aria-label={`Desvincular necesidad de ${a.solicitanteNombre}`}
                                  className="focus-ring inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-accent/15 hover:text-foreground disabled:opacity-50"
                                >
                                  <X className="size-3" strokeWidth={2} aria-hidden />
                                </button>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
              <div className="flex min-w-40 flex-1 flex-col gap-1.5">
                <span className="text-xs font-medium">Añadir recurso</span>
                <Select
                  value={nuevoRecursoId}
                  onValueChange={setNuevoRecursoId}
                  disabled={disponibles.length === 0}
                >
                  <SelectTrigger aria-label="Añadir recurso" className="w-full">
                    <SelectValue
                      placeholder={
                        disponibles.length === 0
                          ? "No quedan recursos disponibles"
                          : "Elige un recurso…"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {disponibles.map((recurso) => (
                      <SelectItem key={recurso.id} value={recurso.id}>
                        {recurso.nombre} ({recurso.unidad})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-32 flex-col gap-1.5">
                <label htmlFor="nueva-meta-cantidad" className="text-xs font-medium">
                  Objetivo
                </label>
                <Input
                  id="nueva-meta-cantidad"
                  type="number"
                  min="0"
                  step="0.01"
                  className="numeric-tnum"
                  value={nuevaCantidad}
                  onChange={(e) => setNuevaCantidad(e.target.valueAsNumber)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pendiente || !nuevoRecursoId}
                onClick={() =>
                  ejecutar(async () => {
                    const resultado = await guardarAction(actividadId, {
                      recursoId: nuevoRecursoId,
                      cantidadObjetivo: nuevaCantidad,
                    });
                    if (resultado.ok) {
                      setNuevoRecursoId("");
                      setNuevaCantidad(1);
                    }
                    return resultado;
                  })
                }
              >
                Añadir meta
              </Button>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        </MetasDropZone>

        <NecesidadesSidebar
          necesidades={necesidades}
          recursoIdsEnActividad={usados}
        />
      </div>

      <DragOverlay dropAnimation={null}>
        {necesidadActiva ? (
          <NecesidadCard necesidad={necesidadActiva} flotante />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
