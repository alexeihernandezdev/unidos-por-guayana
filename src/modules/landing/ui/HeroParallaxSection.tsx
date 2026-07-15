"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Hero de la landing con parallax por capas ligado al scroll.
 *
 * Cuatro capas, de atrás hacia adelante:
 *  1. Fondo (costa de La Guaira): se mueve hacia arriba MÁS rápido que la
 *     figura y hace un zoom agresivo (1→1.16) para dar profundidad.
 *  2. Titular: sube más rápido que el fondo, crece (1→1.22, efecto de
 *     "atravesar" el texto) y se desvanece al 22 % del progreso del hero.
 *  3. Figura (voluntaria sobre la roca): se queda atrás (+38 % de su altura,
 *     con un crecimiento leve 1→1.06 desde su base) y la sección la RECORTA
 *     en su borde inferior: al hacer scroll, la sección siguiente pasa por
 *     encima de las piernas de la figura, como en la referencia (TRK.9).
 *     Todo el hero vive bajo overflow-hidden.
 *  4. Velo: un scrim negro que oscurece la escena (0→0.45) mientras el hero
 *     sale, para que la sección siguiente entre con más drama.
 *
 * La figura v3 es un lienzo panorámico transparente, pero el sujeto ocupa una
 * proporción mayor que en la referencia. Por eso se renderiza al 76 % de la
 * altura, contenida y anclada abajo en desktop; en móvil se recorta al centro
 * para que la persona no pierda presencia. El fondo usa un overscan de 160 %
 * para no descubrir bordes al subir (el viaje de -36 % de su propia altura
 * consume ~58 % de la sección; el borde inferior queda en ~102 %).
 *
 * Ratios del parallax (fracción del progreso 0→1 del hero saliendo del
 * viewport): fondo -36 % de su altura + escala 1→1.16, titular -75vh +
 * escala 1→1.22 con fade en [0, 0.22], figura +38 % de su altura + escala
 * 1→1.06, velo 0→0.45 en [0.15, 0.75].
 *
 * Entrada: wrappers independientes revelan fondo y figura durante los
 * primeros 1.2 s. El titular usa la coreografía de Moving Letters #5
 * ("Signal & Noise", tobiasahlin.com/moving-letters): dos reglas se expanden
 * desde el centro (scaleX 0→1), se separan verticalmente para enmarcar el
 * texto, y las palabras entran deslizándose desde lados opuestos. Separar
 * esos transforms de los MotionValue del scroll evita que la animación de
 * carga sobrescriba el parallax.
 *
 * `prefers-reduced-motion`: los rangos de los transforms colapsan a valores
 * estáticos (0 %) en vez de quitar el `style`. Así el prop que ve React es
 * idéntico en servidor y cliente (mismo MotionValue) y no hay mismatch de
 * hidratación; con reduced-motion las capas simplemente no se mueven.
 */
// Curvas de la coreografía del titular (equivalentes a easeInOutExpo /
// easeOutExpo de anime.js, usadas por la referencia Moving Letters #5).
const easeInOutExpo = [0.87, 0, 0.13, 1] as const;
const easeOutExpo = [0.16, 1, 0.3, 1] as const;

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
    sinMovimiento ? ["0%", "0%"] : ["0%", "-36%"],
  );
  const fondoEscala = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? [1, 1] : [1, 1.16],
  );
  const tituloY = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? ["0vh", "0vh"] : ["0vh", "-75vh"],
  );
  const tituloEscala = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? [1, 1] : [1, 1.22],
  );
  const tituloOpacidad = useTransform(
    scrollYProgress,
    [0, 0.22],
    sinMovimiento ? [1, 1] : [1, 0],
  );
  const figuraY = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? ["0%", "0%"] : ["0%", "38%"],
  );
  const figuraEscala = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? [1, 1] : [1, 1.06],
  );
  const veloOpacidad = useTransform(
    scrollYProgress,
    [0.15, 0.75],
    sinMovimiento ? [0, 0] : [0, 0.45],
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
      {/* Capa 1 · Fondo con overscan del 160 %. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={sinMovimiento ? false : { opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 origin-center will-change-transform"
        >
          <motion.div
            style={{ y: fondoY, scale: fondoEscala }}
            className="absolute inset-x-0 top-0 h-[160%] origin-center will-change-transform"
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

      {/* Capa 2 · Titular. Entre el fondo y la figura: el display queda
          parcialmente detrás de la persona en desktop, ese solape es parte
          del efecto. Sube más rápido que el fondo, crece hacia el lector
          (zoom-through) y muere al 22 %.

          Entrada Moving Letters #5: las dos reglas nacen superpuestas en el
          centro del bloque (y = ±1.05em ≈ media altura de las dos filas),
          se expanden en X y luego viajan a su posición final enmarcando el
          texto; las palabras entran desde lados opuestos mientras las reglas
          aún se separan. Las reglas usan unidades em (heredan el font-size
          del h1) para que la coreografía escale con el clamp. */}
      <div className="absolute inset-x-0 top-[12%] z-10 px-6 text-center">
        <motion.div
          style={{ y: tituloY, scale: tituloEscala, opacity: tituloOpacidad }}
          className="origin-center will-change-transform"
        >
          <motion.p
            initial={sinMovimiento ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/60"
          >
            La Guaira · Venezuela
          </motion.p>
          <h1
            // Mismo tratamiento display que el h2 de ActiveShipmentsSection
            // ("Operación en curso"): EB Garamond medium, leading 0.88,
            // tracking -0.035em. Un solo dibujo serif en toda la landing.
            className="mx-auto mt-4 flex w-fit flex-col items-center font-serif text-[clamp(3rem,9vw,6rem)] font-medium leading-[0.88] tracking-[-0.035em] text-foreground"
          >
            <motion.span
              aria-hidden
              initial={
                sinMovimiento ? false : { scaleX: 0, y: "1.05em", opacity: 0.5 }
              }
              animate={
                sinMovimiento
                  ? { scaleX: 1, y: "0em", opacity: 1 }
                  : {
                      scaleX: [0, 1, 1],
                      y: ["1.05em", "1.05em", "0em"],
                      opacity: [0.5, 1, 1],
                    }
              }
              transition={{
                delay: 0.25,
                duration: 1.15,
                times: [0, 0.52, 1],
                ease: [easeInOutExpo, easeOutExpo],
              }}
              className="mb-[0.14em] block h-[0.045em] w-full origin-center bg-foreground/75 will-change-transform"
            />
            <motion.span
              initial={sinMovimiento ? false : { opacity: 0, x: "0.55em" }}
              animate={{ opacity: 1, x: "0em" }}
              transition={{ delay: 0.95, duration: 0.65, ease: easeOutExpo }}
              className="block will-change-transform"
            >
              Unidos Por
            </motion.span>
            <motion.span
              initial={sinMovimiento ? false : { opacity: 0, x: "-0.55em" }}
              animate={{ opacity: 1, x: "0em" }}
              transition={{ delay: 1.1, duration: 0.65, ease: easeOutExpo }}
              className="block italic text-primary-ink will-change-transform"
            >
              La Guaira
            </motion.span>
            <motion.span
              aria-hidden
              initial={
                sinMovimiento
                  ? false
                  : { scaleX: 0, y: "-1.05em", opacity: 0.5 }
              }
              animate={
                sinMovimiento
                  ? { scaleX: 1, y: "0em", opacity: 1 }
                  : {
                      scaleX: [0, 1, 1],
                      y: ["-1.05em", "-1.05em", "0em"],
                      opacity: [0.5, 1, 1],
                    }
              }
              transition={{
                delay: 0.25,
                duration: 1.15,
                times: [0, 0.52, 1],
                ease: [easeInOutExpo, easeOutExpo],
              }}
              className="mt-[0.16em] block h-[0.045em] w-full origin-center bg-foreground/75 will-change-transform"
            />
          </h1>
          <motion.p
            initial={sinMovimiento ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.45, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            className="mx-auto mt-6 max-w-[42ch] text-sm text-foreground/70 [text-wrap:pretty] md:text-base"
          >
            Coordinamos la ayuda humanitaria que sale desde la costa. Cada
            aporte queda registrado.
          </motion.p>
        </motion.div>
      </div>

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
          reproducir la escala de la referencia. Su viaje hacia abajo (+38 %)
          la hunde tras el borde inferior del hero, que la recorta; el
          crecimiento leve desde la base exagera la sensación de cámara
          subiendo junto a ella. */}
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
            style={{ y: figuraY, scale: figuraEscala }}
            className="absolute inset-0 origin-bottom will-change-transform"
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

      {/* Capa 4 · Velo. Oscurece toda la escena mientras el hero sale para
          que la sección siguiente "apague la luz" al pasar por encima. Solo
          anima opacity: barato y sin reflow. */}
      <motion.div
        aria-hidden
        style={{ opacity: veloOpacidad }}
        className="pointer-events-none absolute inset-0 z-30 bg-black"
      />
    </section>
  );
}
