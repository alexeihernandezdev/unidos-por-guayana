"use client"

import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible"
import { cn } from "@/shared/lib/utils"

type Props = {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  // Acento de error cuando la sección (colapsada o no) tiene campos inválidos.
  invalid?: boolean
  children: ReactNode
}

// Sección plegable con cabecera clicable y chevron. El contenido se mantiene
// montado (`forceMount` + `hidden` por CSS) para que React Hook Form conserve los
// valores y siga validando los campos aunque la sección esté cerrada.
export function CollapsibleSection({
  title,
  open,
  onOpenChange,
  invalid = false,
  children,
}: Props) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        "rounded-lg border bg-primary/[0.035]",
        invalid ? "border-destructive/60" : "border-border",
      )}
    >
      <CollapsibleTrigger className="focus-ring group flex w-full items-center justify-between gap-2 rounded-lg px-4 py-3.5 text-left">
        <span className="text-sm font-medium">{title}</span>
        <ChevronDown
          aria-hidden
          strokeWidth={1.5}
          className="size-4 text-muted-foreground transition-transform duration-200 ease-out group-data-[state=open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent forceMount className="data-[state=closed]:hidden">
        <div className="flex flex-col gap-4 px-4 pb-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
