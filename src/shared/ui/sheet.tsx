"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { X } from "lucide-react"

import { cn } from "@/shared/lib/utils"

// Sheet primitivo (shadcn-style) sobre Radix Dialog. La animación es transform +
// opacity con nuestra easing --ease-out-emil; no depende de tailwindcss-animate.
// Radix expone `data-state="open|closed"` en Overlay y Content, que usamos con
// selectors arbitrarios `data-[state=...]`.

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(
  props: React.ComponentProps<typeof SheetPrimitive.Trigger>,
) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(
  props: React.ComponentProps<typeof SheetPrimitive.Close>,
) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal(
  props: React.ComponentProps<typeof SheetPrimitive.Portal>,
) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-foreground/30",
        "transition-opacity duration-200 [transition-timing-function:var(--ease-out-emil)]",
        "data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
        "motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  )
}

type SheetContentProps = React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}

// Transforms de apertura/cierre por lado. Se aplican con data-state.
const sideMotion: Record<NonNullable<SheetContentProps["side"]>, string> = {
  left:
    "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0",
  right:
    "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
  top: "inset-x-0 top-0 border-b data-[state=closed]:-translate-y-full data-[state=open]:translate-y-0",
  bottom:
    "inset-x-0 bottom-0 border-t data-[state=closed]:translate-y-full data-[state=open]:translate-y-0",
}

function SheetContent({
  className,
  side = "right",
  children,
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-4 border-border bg-background shadow-lg",
          "transition-transform duration-300 [transition-timing-function:var(--ease-out-emil)]",
          "motion-reduce:transition-none",
          sideMotion[side],
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          className="focus-ring absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-md text-foreground/70 transition-colors duration-150 hover:bg-muted hover:text-accent"
          aria-label="Cerrar"
        >
          <X strokeWidth={1.5} className="size-4" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1 px-6 pt-6", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex flex-col gap-2 border-t border-border px-6 py-4",
        className,
      )}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "font-serif text-lg leading-none tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
