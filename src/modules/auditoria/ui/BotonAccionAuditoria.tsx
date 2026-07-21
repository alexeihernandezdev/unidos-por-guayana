"use client";

import { LoaderCircle, ScanSearch } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/shared/ui/button";

export function BotonAccionAuditoria({
  children,
  pendingLabel,
  variant = "default",
  className,
  icon = false,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "default" | "outline";
  className?: string;
  icon?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending} className={className}>
      {pending ? (
        <LoaderCircle className="animate-spin" strokeWidth={1.5} aria-hidden />
      ) : icon ? (
        <ScanSearch strokeWidth={1.5} aria-hidden />
      ) : null}
      {pending ? pendingLabel : children}
    </Button>
  );
}
