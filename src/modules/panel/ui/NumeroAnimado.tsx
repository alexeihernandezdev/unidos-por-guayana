"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

// Conteo de entrada del dashboard: el número "sube" de 0 al valor al montar. Es
// un momento de entrada puntual (no una interacción repetida), por eso puede
// pasar del cap de 300ms de UI de la constitución. Respeta prefers-reduced-motion
// (muestra el valor final al instante) y usa requestAnimationFrame (sin timers ni
// animar layout). El snapshot de servidor del hook es "sin motion", así que el
// SSR renderiza 0 y la animación arranca tras la hidratación.
const DURACION_MS = 750;

// Cubic ease-out: arranca rápido y desacelera al llegar (misma sensación que
// --ease-out-emil).
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

type Props = {
  valor: number;
  className?: string;
};

export function NumeroAnimado({ valor, className }: Props) {
  const reducir = usePrefersReducedMotion();
  const [mostrado, setMostrado] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Duración 0 con reduced-motion: el primer frame ya deja el valor final. El
    // setState vive dentro del rAF (no en el cuerpo del effect), así no dispara
    // renders en cascada ni el lint `set-state-in-effect`.
    const duracion = reducir ? 0 : DURACION_MS;
    let inicio: number | null = null;
    const paso = (t: number) => {
      if (inicio === null) inicio = t;
      const progreso =
        duracion === 0 ? 1 : Math.min(1, (t - inicio) / duracion);
      setMostrado(Math.round(easeOut(progreso) * valor));
      if (progreso < 1) {
        rafRef.current = requestAnimationFrame(paso);
      }
    };
    rafRef.current = requestAnimationFrame(paso);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [valor, reducir]);

  return <span className={className}>{mostrado}</span>;
}
