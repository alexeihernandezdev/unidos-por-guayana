"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { MetaRecurso } from "@/modules/actividades/domain/Actividad";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { RecursoOpcion } from "./ActividadForm";

type Resultado = { ok: boolean; error?: string };

type Props = {
  actividadId: string;
  metas: MetaRecurso[];
  recursos: RecursoOpcion[];
  // Server actions ligadas por la página. `guardar` hace upsert (añadir o cambiar
  // objetivo); `quitar` elimina la meta del recurso indicado.
  guardarAction: (
    actividadId: string,
    input: { recursoId: string; cantidadObjetivo: number },
  ) => Promise<Resultado>;
  quitarAction: (actividadId: string, recursoId: string) => Promise<Resultado>;
};

const campo =
  "rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

// Editor de metas para una Actividad en RECOLECTANDO: añade, cambia el objetivo o quita
// metas, cada operación contra el servidor (upsert/quitar) y refrescando la vista.
export function MetasEditor({
  actividadId,
  metas,
  recursos,
  guardarAction,
  quitarAction,
}: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Cantidades editables por recurso (clave = recursoId).
  const [cantidades, setCantidades] = useState<Record<string, number>>(() =>
    Object.fromEntries(metas.map((m) => [m.recursoId, m.cantidadObjetivo])),
  );

  const usados = useMemo(
    () => new Set(metas.map((m) => m.recursoId)),
    [metas],
  );
  const disponibles = useMemo(
    () => recursos.filter((r) => !usados.has(r.id)),
    [recursos, usados],
  );

  const [nuevoRecursoId, setNuevoRecursoId] = useState<string>("");
  const [nuevaCantidad, setNuevaCantidad] = useState<number>(1);

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

  return (
    <div className="flex flex-col gap-4">
      {metas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Esta actividad aún no tiene metas.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {metas.map((meta) => (
            <li key={meta.id} className="flex flex-wrap items-end gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {meta.recurso?.nombre ?? "Recurso"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Objetivo en {meta.recurso?.unidad ?? "unidades"}
                </p>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`${campo} numeric-tnum w-32`}
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
                        cantidades[meta.recursoId] ?? meta.cantidadObjetivo,
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
                disabled={pendiente}
                onClick={() =>
                  ejecutar(() => quitarAction(actividadId, meta.recursoId))
                }
              >
                <Trash2 strokeWidth={1.5} />
              </Button>
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
          <input
            id="nueva-meta-cantidad"
            type="number"
            min="0"
            step="0.01"
            className={`${campo} numeric-tnum`}
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
  );
}
