"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

type Props = {
  valor: number;
  sufijo?: string;
  decimales?: number;
  duracion?: number;
  className?: string;
};

// Curva compartida del proyecto (`--ease-out-emil`), en forma de tuple para Motion.
const EASE_EMIL = [0.23, 1, 0.32, 1] as const;

function formatear(valor: number, decimales: number): string {
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  }).format(valor);
}

// Contador que cuenta desde 0 hasta `valor` cuando entra en viewport. Anima solo texto
// (sin layout), respeta `prefers-reduced-motion` (muestra el valor final de una) y usa la
// curva de easing única del proyecto. Los números usan `numeric-tnum` para no bailar de
// ancho mientras suben.
export function ContadorAnimado({
  valor,
  sufijo = "",
  decimales = 0,
  duracion = 1.4,
  className = "",
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const enVista = useInView(ref, { once: true, amount: 0.4 });
  const reducir = useReducedMotion();
  const mv = useMotionValue(0);
  const texto = useTransform(mv, (v) => formatear(v, decimales));

  useEffect(() => {
    if (!enVista) return;
    if (reducir) {
      mv.set(valor);
      return;
    }
    const controles = animate(mv, valor, { duration: duracion, ease: EASE_EMIL });
    return () => controles.stop();
  }, [enVista, reducir, valor, duracion, mv]);

  return (
    <span ref={ref} className={`numeric-tnum tabular-nums ${className}`.trim()}>
      <motion.span>{texto}</motion.span>
      {sufijo}
    </span>
  );
}
