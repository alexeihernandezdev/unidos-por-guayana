"use client";

import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/shared/lib/utils";

// Identificador único de la zona de metas como destino de arrastre (feature 030).
export const METAS_DROPPABLE_ID = "metas-dropzone";

// Zona donde se sueltan las necesidades para convertirlas en metas de la actividad. Se
// ilumina con `primary` mientras una necesidad se arrastra por encima. `activo` indica
// que hay un arrastre en curso, para mostrar el borde punteado de invitación.
export function MetasDropZone({
  activo,
  children,
  className,
}: {
  activo: boolean;
  children: ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: METAS_DROPPABLE_ID });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl transition-[background-color,box-shadow] duration-200 ease-[var(--ease-out-emil)] motion-reduce:transition-none",
        activo &&
          "outline-dashed outline-2 outline-offset-4 outline-border",
        isOver &&
          "bg-primary/5 outline-primary/50 ring-2 ring-primary/30 ring-offset-4 ring-offset-background",
        className,
      )}
    >
      {children}
    </div>
  );
}
