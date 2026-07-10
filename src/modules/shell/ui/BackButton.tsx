"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";

type Props = {
  /** Ruta de respaldo si no hay historial (p. ej. panel principal del rol). */
  fallbackHref: string;
  className?: string;
};

/**
 * Navegación atrás dentro del panel. Usa el historial del navegador cuando
 * existe; si no, lleva al inicio del panel del usuario.
 */
export function BackButton({ fallbackHref, className }: Props) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={className}
    >
      <ArrowLeftIcon strokeWidth={1.5} className="size-4" />
      Atrás
    </Button>
  );
}
