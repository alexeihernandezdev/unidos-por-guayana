"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";

export type PanelFormModalSize = "default" | "wide";

export const PANEL_FORM_MODAL_MAX_W: Record<PanelFormModalSize, string> = {
  default: "sm:max-w-lg",
  wide: "sm:max-w-2xl",
};

type PanelFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: PanelFormModalSize;
  children: ReactNode;
  className?: string;
};

// Modal estándar para formularios pequeños del panel (feature 027). Wrapper sobre
// el Dialog de Radix con bordes más redondos, scroll interno y tamaños predefinidos.
export function PanelFormModal({
  open,
  onOpenChange,
  title,
  description,
  size = "default",
  children,
  className,
}: PanelFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "!rounded-2xl max-h-[90dvh] overflow-y-auto",
          PANEL_FORM_MODAL_MAX_W[size],
          className,
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
