"use client";

import { useSyncExternalStore } from "react";

// Respeta `prefers-reduced-motion` (obligatorio por la constitución de estilo) para
// desactivar las animaciones de entrada de Recharts. Usa `useSyncExternalStore`:
// evita el setState-en-effect y da un snapshot de servidor estable (sin motion
// asumido) que no rompe la hidratación.
const CONSULTA = "(prefers-reduced-motion: reduce)";

function suscribir(alCambiar: () => void): () => void {
  const mq = window.matchMedia(CONSULTA);
  mq.addEventListener("change", alCambiar);
  return () => mq.removeEventListener("change", alCambiar);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(CONSULTA).matches,
    () => false,
  );
}
