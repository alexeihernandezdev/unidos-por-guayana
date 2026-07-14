"use client";

import type { ReactNode } from "react";
import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import "lenis/dist/lenis.css";

/**
 * Smooth scroll global (Lenis) para la landing. En modo `root` no envuelve a
 * los children en ningún div: instala la instancia sobre el scroll nativo de
 * la ventana, así el layout flex de <body> queda intacto y los children
 * siguen siendo server components.
 *
 * `prefers-reduced-motion`: cuando está activo se apaga `smoothWheel` y el
 * scroll queda 100 % nativo (Lenis no interviene sobre la rueda). Cambiar la
 * opción recrea la instancia interna sin remontar el árbol de children.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const prefiereMenosMovimiento = useReducedMotion();

  return (
    <ReactLenis
      root
      options={{
        smoothWheel: prefiereMenosMovimiento !== true,
        // lerp por defecto (0.1): inercia perceptible sin desligar el scroll
        // del gesto. Anchors: respeta los links #hash del header.
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
