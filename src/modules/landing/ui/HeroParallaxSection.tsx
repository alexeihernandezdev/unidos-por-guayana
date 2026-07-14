"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Hero de la landing con parallax por capas ligado al scroll.
 *
 * Tres capas, de atrás hacia adelante:
 *  1. Fondo (costa de La Guaira): se mueve hacia arriba MÁS rápido que la
 *     figura y hace un zoom sutil (1→1.07) para dar profundidad.
 *  2. Titular: sube más rápido que el fondo y se desvanece al 30 % del
 *     progreso del hero.
 *  3. Figura (voluntaria sobre la roca): se queda atrás (+24 % de su altura)
 *     y la sección la RECORTA en su borde inferior: al hacer scroll, la
 *     sección siguiente pasa por encima de las piernas de la figura, como en
 *     la referencia (TRK.9). Todo el hero vive bajo overflow-hidden.
 *
 * La figura v3 es un lienzo panorámico transparente, pero el sujeto ocupa una
 * proporción mayor que en la referencia. Por eso se renderiza al 76 % de la
 * altura, contenida y anclada abajo en desktop; en móvil se recorta al centro
 * para que la persona no pierda presencia. El fondo usa un overscan de 140 %
 * para no descubrir bordes al subir (el viaje de -26 % de su propia altura
 * consume ~36 % de la sección; el borde inferior queda en ~104 %).
 *
 * Ratios del parallax (fracción del progreso 0→1 del hero saliendo del
 * viewport): fondo -26 % de su altura + escala 1→1.07, titular -58vh con
 * fade en [0, 0.3], figura +24 % de su altura.
 *
 * Entrada: wrappers independientes revelan fondo, titular y figura durante
 * los primeros 1.2 s. Separar esos transforms de los MotionValue del scroll
 * evita que la animación de carga sobrescriba el parallax.
 *
 * `prefers-reduced-motion`: los rangos de los transforms colapsan a valores
 * estáticos (0 %) en vez de quitar el `style`. Así el prop que ve React es
 * idéntico en servidor y cliente (mismo MotionValue) y no hay mismatch de
 * hidratación; con reduced-motion las capas simplemente no se mueven.
 */
export function HeroParallaxSection() {
  const seccionRef = useRef<HTMLElement>(null);
  const sinMovimiento = useReducedMotion() === true;

  const { scrollYProgress } = useScroll({
    target: seccionRef,
    // 0 cuando el tope del hero toca el tope del viewport; 1 cuando su borde
    // inferior lo abandona. Todo el efecto vive en ese recorrido.
    offset: ["start start", "end start"],
  });

  const fondoY = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? ["0%", "0%"] : ["0%", "-26%"],
  );
  const fondoEscala = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? [1, 1] : [1, 1.07],
  );
  const tituloY = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? ["0vh", "0vh"] : ["0vh", "-58vh"],
  );
  const tituloOpacidad = useTransform(
    scrollYProgress,
    [0, 0.3],
    sinMovimiento ? [1, 1] : [1, 0],
  );
  const figuraY = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? ["0%", "0%"] : ["0%", "24%"],
  );

  return (
    <section
      ref={seccionRef}
      // Altura: viewport menos el header sticky que haya montado el layout
      // (--altura-header: h-16 visitante, h-14 con sesión). Si el hero
      // asumiera una altura fija, con sesión quedaría una franja de
      // desalineación en el pliegue.
      // overflow-hidden: recorta las tres capas en el borde del hero. La
      // figura, al quedarse atrás (+24 %), es tragada por la sección
      // siguiente durante el scroll, como en la referencia.
      className="relative h-[calc(100svh-var(--altura-header,4rem))] min-h-[540px] overflow-hidden"
    >
      {/* Capa 1 · Fondo con overscan del 140 %. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={sinMovimiento ? false : { opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 origin-center will-change-transform"
        >
          <motion.div
            style={{ y: fondoY, scale: fondoEscala }}
            className="absolute inset-x-0 top-0 h-[140%] origin-center will-change-transform"
          >
            <Image
              src="/assets/landing/hero/hero-bg.webp"
              alt=""
              fill
              unoptimized
              preload
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Capa 2 · Titular. Entre el fondo y la figura: el serif queda
          parcialmente detrás de la persona en desktop, ese solape es parte
          del efecto. Sube más rápido que el fondo y muere al 30 %. */}
      <motion.div
        initial={sinMovimiento ? false : { opacity: 0, y: 56, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: 0.16,
          duration: 0.78,
          ease: [0.23, 1, 0.32, 1],
        }}
        className="absolute inset-x-0 top-[12%] z-10 px-6 text-center will-change-transform"
      >
        <motion.div
          style={{ y: tituloY, opacity: tituloOpacidad }}
          className="will-change-transform"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/60">
            La Guaira · Venezuela
          </p>
          <h1
            className="mx-auto mt-4 max-w-4xl font-serif text-[clamp(2.5rem,7vw,3.75rem)] font-medium text-foreground [text-wrap:balance]"
            style={{ lineHeight: 0.98, letterSpacing: "-0.02em" }}
          >
            Unidos
            <br />
            <span className="italic text-primary-ink">La Guaira</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[42ch] text-sm text-foreground/70 [text-wrap:pretty] md:text-base">
            Coordinamos la ayuda humanitaria que sale desde la costa. Cada
            aporte queda registrado.
          </p>
        </motion.div>
      </motion.div>

      {/* Pista de scroll: acompaña la opacidad del titular. Solo desktop. */}
      <motion.div
        initial={sinMovimiento ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.52,
          duration: 0.58,
          ease: [0.23, 1, 0.32, 1],
        }}
        className="absolute bottom-8 left-8 z-10 hidden items-center gap-3 md:flex"
        aria-hidden
      >
        <motion.div
          style={{ opacity: tituloOpacidad }}
          className="flex items-center gap-3"
        >
          <span className="h-10 w-px bg-white/50" />
          <span
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/85"
            style={{ textShadow: "0 1px 8px oklch(0 0 0 / 0.4)" }}
          >
            Desliza
          </span>
        </motion.div>
      </motion.div>

      {/* Capa 3 · Figura. V3 se ancla abajo y usa contain en desktop para
          reproducir la escala de la referencia. Su viaje hacia abajo (+24 %)
          la hunde tras el borde inferior del hero, que la recorta. */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <motion.div
          initial={sinMovimiento ? false : { opacity: 0, y: 120, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.2,
            duration: 1.05,
            ease: [0.23, 1, 0.32, 1],
          }}
          className="absolute inset-x-0 bottom-0 h-[76%] will-change-transform"
        >
          <motion.div
            style={{ y: figuraY }}
            className="absolute inset-0 will-change-transform"
          >
            <Image
              src="/assets/landing/hero/hero-figure-v3.png"
              alt="Voluntaria sobre una roca mirando la costa de La Guaira."
              fill
              unoptimized
              preload
              sizes="100vw"
              className="object-cover object-center md:object-contain md:object-bottom"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
