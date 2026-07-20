"use client";

import { useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Inbox, PackageSearch, Search, Target } from "lucide-react";
import type { NecesidadPendiente } from "@/modules/atenciones/domain/Atencion";
import {
  CATEGORIAS_RECURSO,
  type CategoriaRecurso,
} from "@/modules/recursos/domain/CategoriaRecurso";
import {
  URGENCIAS_SOLICITUD,
  type UrgenciaSolicitud,
} from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { NecesidadCard } from "./NecesidadCard";

const CATEGORIA_LABEL: Record<CategoriaRecurso, string> = {
  SUMINISTRO: "Suministros",
  TRANSPORTE: "Transporte",
  PERSONAL: "Personal",
  MONETARIO: "Monetario",
};

const URGENCIA_LABEL: Record<UrgenciaSolicitud, string> = {
  ALTA: "Alta",
  MEDIA: "Media",
  BAJA: "Baja",
};

const TODOS = "__todos__";

// Envoltorio arrastrable de una tarjeta de necesidad. `id` = recursoSolicitudId; expone
// la necesidad completa en `data` para que el `onDragEnd` del formulario la reciba.
function DraggableNecesidad({
  necesidad,
  coincide,
  deshabilitada,
}: {
  necesidad: NecesidadPendiente;
  coincide: boolean;
  deshabilitada: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: necesidad.recursoSolicitudId,
    data: { necesidad },
    disabled: deshabilitada,
  });

  return (
    <div
      ref={setNodeRef}
      {...(deshabilitada ? {} : listeners)}
      {...attributes}
      className={cn(
        "rounded-lg outline-none",
        "focus-visible:ring-2 focus-visible:ring-accent/50",
        !deshabilitada && "touch-none",
      )}
    >
      <NecesidadCard
        necesidad={necesidad}
        coincide={coincide}
        deshabilitada={deshabilitada}
        arrastrando={isDragging}
      />
    </div>
  );
}

type Props = {
  necesidades: NecesidadPendiente[];
  // Recursos que ya son meta de la actividad: sus necesidades se marcan como coincidencia.
  recursoIdsEnActividad: Set<string>;
  // Necesidades (recursoSolicitudId) ya vinculadas en el formulario (alta): se ocultan.
  ocultarIds?: Set<string>;
};

// Sidebar de necesidades pendientes con toolbar de filtros (feature 030). Filtra en el
// cliente por texto, sector, urgencia, categoría y coincidencia con las metas de la
// actividad; las tarjetas se arrastran a la zona de metas.
export function NecesidadesSidebar({
  necesidades,
  recursoIdsEnActividad,
  ocultarIds,
}: Props) {
  const [texto, setTexto] = useState("");
  const [sector, setSector] = useState<string>(TODOS);
  const [urgencia, setUrgencia] = useState<string>(TODOS);
  const [categoria, setCategoria] = useState<string>(TODOS);
  const [soloCoincidencias, setSoloCoincidencias] = useState(false);

  const visibles = useMemo(
    () => necesidades.filter((n) => !ocultarIds?.has(n.recursoSolicitudId)),
    [necesidades, ocultarIds],
  );

  const sectores = useMemo(
    () => [...new Set(visibles.map((n) => n.sector))].sort(),
    [visibles],
  );

  const filtradas = useMemo(() => {
    const q = texto.trim().toLowerCase();
    return visibles.filter((n) => {
      const coincide = recursoIdsEnActividad.has(n.recurso.id);
      if (soloCoincidencias && !coincide) return false;
      if (sector !== TODOS && n.sector !== sector) return false;
      if (urgencia !== TODOS && n.urgencia !== urgencia) return false;
      if (categoria !== TODOS && n.recurso.categoria !== categoria) return false;
      if (
        q &&
        !n.recurso.nombre.toLowerCase().includes(q) &&
        !n.sector.toLowerCase().includes(q) &&
        !n.solicitanteNombre.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [visibles, texto, sector, urgencia, categoria, soloCoincidencias, recursoIdsEnActividad]);

  return (
    <aside className="flex flex-col gap-3 rounded-xl border border-border bg-muted/25 p-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]">
      <header className="flex items-center gap-2 px-0.5">
        <span className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-foreground/70">
          <PackageSearch className="size-4" strokeWidth={1.5} aria-hidden />
        </span>
        <div className="flex flex-1 flex-col">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Necesidades pendientes
          </h3>
          <p className="text-xs text-muted-foreground">
            Arrástralas a la actividad para atenderlas.
          </p>
        </div>
        <span className="numeric-tnum rounded-full bg-card px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {filtradas.length}
        </span>
      </header>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
          <Input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar recurso, sector o persona…"
            aria-label="Buscar necesidades"
            className="h-9 pl-8 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FiltroSelect
            valor={sector}
            onValueChange={setSector}
            etiqueta="Sector"
            placeholder="Sector"
            opciones={sectores.map((s) => ({ valor: s, label: s }))}
          />
          <FiltroSelect
            valor={urgencia}
            onValueChange={setUrgencia}
            etiqueta="Urgencia"
            placeholder="Urgencia"
            opciones={URGENCIAS_SOLICITUD.map((u) => ({
              valor: u,
              label: URGENCIA_LABEL[u],
            }))}
          />
          <FiltroSelect
            valor={categoria}
            onValueChange={setCategoria}
            etiqueta="Categoría"
            placeholder="Categoría"
            opciones={CATEGORIAS_RECURSO.map((c) => ({
              valor: c,
              label: CATEGORIA_LABEL[c],
            }))}
          />
          <button
            type="button"
            aria-pressed={soloCoincidencias}
            onClick={() => setSoloCoincidencias((v) => !v)}
            className={cn(
              "focus-ring inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-2.5 text-xs font-medium",
              "transition-colors duration-200 ease-[var(--ease-out-emil)]",
              soloCoincidencias
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
            )}
          >
            <Target className="size-3.5" strokeWidth={1.5} aria-hidden />
            Coincidencias
          </button>
        </div>
      </div>

      <div className="-mx-1 flex-1 overflow-y-auto px-1">
        {filtradas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
            <Inbox className="size-6 text-muted-foreground/60" strokeWidth={1.5} aria-hidden />
            <p className="text-xs text-muted-foreground">
              {visibles.length === 0
                ? "No hay necesidades pendientes por atender."
                : "Ninguna necesidad coincide con el filtro."}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2 pb-1">
            {filtradas.map((n) => (
              <li key={n.recursoSolicitudId}>
                <DraggableNecesidad
                  necesidad={n}
                  coincide={recursoIdsEnActividad.has(n.recurso.id)}
                  deshabilitada={!n.recurso.seleccionable}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function FiltroSelect({
  valor,
  onValueChange,
  etiqueta,
  placeholder,
  opciones,
}: {
  valor: string;
  onValueChange: (v: string) => void;
  etiqueta: string;
  placeholder: string;
  opciones: { valor: string; label: string }[];
}) {
  return (
    <Select value={valor} onValueChange={onValueChange}>
      <SelectTrigger aria-label={etiqueta} className="w-full text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TODOS}>{placeholder}: todas</SelectItem>
        {opciones.map((o) => (
          <SelectItem key={o.valor} value={o.valor}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
