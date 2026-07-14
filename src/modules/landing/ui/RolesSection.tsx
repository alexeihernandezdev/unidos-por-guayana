"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  cubicBezier,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

/**
 * Primera sección tras el hero parallax: los tres roles de la plataforma como
 * tarjetas fotográficas, siguiendo la referencia (TRK.9): foto a sangre,
 * degradado inferior, título sobre la imagen y botón circular de flecha.
 *
 * Motion (dos tiempos, como en el gif de referencia):
 *  1. Tarjetas ligadas al scroll: cada una nace con un desfase vertical
 *     distinto (140 / 260 / 195 px) y escala 0.91, y converge a su fila a
 *     medida que la sección entra en viewport. El recorrido empieza cuando
 *     el tope cruza el 80 % del viewport y termina al llegar al 34 %: así el
 *     efecto se percibe durante la transición desde el hero, pero las tarjetas
 *     ya están asentadas cuando la sección ocupa la vista. En desktop las tres
 *     entran a la vez; en móvil cada tarjeta hace su propio viaje.
 *     Solo transforms + opacity, sin CLS (el layout no se mueve, solo el
 *     paint).
 *  2. El pie de cada tarjeta (título, descripción, CTA) comparte el mismo
 *     progreso: funde y sube en [0.34, 0.62], mientras la tarjeta cruza la
 *     zona central. No usa una transición temporal independiente, por lo que
 *     no puede adelantarse al scroll.
 * Hover: zoom sutil de la foto (≤1.05) y relleno teal de la flecha.
 * `prefers-reduced-motion` deja tarjetas y pies completamente estáticos y
 * visibles. Los `?rol=` siguen la convención de los CTAs existentes
 * (SiteFooter, FinalCtaSection).
 */
const EASE_EMIL = [0.23, 1, 0.32, 1] as const;
const easeEmil = cubicBezier(...EASE_EMIL);
const easeScroll = cubicBezier(0.45, 0, 0.55, 1);

/** Desfases iniciales por tarjeta (px). No monótonos a propósito: la
 *  referencia escalona medio / bajo / medio-alto, no una rampa. */
const DESFASES = [140, 260, 195] as const;

const ROLES = [
  {
    numero: "01",
    titulo: "Colaborador",
    descripcion: "Aporta insumos a los centros de acopio o a quienes los piden.",
    cta: "Quiero colaborar",
    href: "/registro?rol=COLABORADOR",
    imagen: "/assets/help1.webp",
    alt: "Voluntarios clasificando cajas de ayuda humanitaria en un centro de acopio.",
  },
  {
    numero: "02",
    titulo: "Solicitante",
    descripcion: "Pide lo que tu comunidad necesita y sigue tu solicitud hasta la entrega.",
    cta: "Necesito ayuda",
    href: "/registro?rol=SOLICITANTE",
    imagen: "/assets/help2.jpg",
    alt: "Trabajadora humanitaria entregando un paquete de ayuda a una niña.",
  },
  {
    numero: "03",
    titulo: "Administrador",
    descripcion: "Gestiona un centro de acopio y coordina los despachos a cada sector.",
    cta: "Administro un centro",
    href: "/registro?rol=ADMIN",
    imagen: "/assets/help4.avif",
    alt: "Coordinador supervisando la carga de insumos organizados en paletas.",
  },
] as const;

type Rol = (typeof ROLES)[number];

/**
 * Tarjeta con parallax de entrada propio. Cada tarjeta observa su posición en
 * el viewport: progreso 0 al cruzar el 80 % de la pantalla y 1 al llegar al
 * 34 %. En ese recorrido baja su desfase a 0 y escala de 0.91→1 con una curva
 * simétrica; el pie aparece mientras la sección reemplaza visualmente al hero.
 */
function TarjetaRol({
  rol,
  indice,
  sinMovimiento,
}: {
  rol: Rol;
  indice: number;
  sinMovimiento: boolean;
}) {
  const tarjetaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: tarjetaRef,
    offset: ["start 0.8", "start 0.34"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? [0, 0] : [DESFASES[indice], 0],
    { ease: easeScroll },
  );
  const escala = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? [1, 1] : [0.91, 1],
    { ease: easeScroll },
  );
  const opacidad = useTransform(
    scrollYProgress,
    [0, 0.28],
    sinMovimiento ? [1, 1] : [0, 1],
  );
  const pieOpacidad = useTransform(
    scrollYProgress,
    [0.12, 0.48],
    sinMovimiento ? [1, 1] : [0, 1],
  );
  const pieY = useTransform(
    scrollYProgress,
    [0.12, 0.48],
    sinMovimiento ? [0, 0] : [20, 0],
    { ease: easeEmil },
  );

  return (
    <motion.div
      ref={tarjetaRef}
      style={{ y, scale: escala, opacity: opacidad }}
      className="will-change-transform"
    >
      <Link
        href={rol.href}
        className="focus-ring group relative block aspect-[4/5] overflow-hidden rounded-xl"
      >
        <Image
          src={rol.imagen}
          alt={rol.alt}
          fill
          unoptimized
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-300 ease-[var(--ease-out-emil)] group-hover:scale-[1.04]"
        />
        {/* Degradado de legibilidad: el texto blanco necesita ≥4.5:1
            sobre cualquier foto. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/75 via-black/30 to-transparent"
        />
        <span className="numeric-tnum absolute left-5 top-5 font-mono text-xs text-white/85 [text-shadow:0_1px_8px_rgb(0_0_0/0.5)]">
          {rol.numero}
        </span>
        {/* Pie: aparece al cruzar la zona central, ligado al mismo scroll. */}
        <motion.div
          style={{ y: pieY, opacity: pieOpacidad }}
          className="absolute inset-x-0 bottom-0 p-5 md:p-6"
        >
          <h3 className="font-serif text-2xl font-medium text-white">
            {rol.titulo}
          </h3>
          <p className="mt-2 text-sm text-white/85 [text-wrap:pretty]">
            {rol.descripcion}
          </p>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-medium text-white">{rol.cta}</span>
            <span
              aria-hidden
              className="flex size-9 items-center justify-center rounded-full border border-white/60 text-white transition-colors duration-200 ease-[var(--ease-out-emil)] group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
            >
              <ArrowRight className="size-4" />
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function RolesSection() {
  const sinMovimiento = useReducedMotion() === true;

  const contenedor = {
    oculto: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const pieza = {
    oculto: { opacity: 0, y: sinMovimiento ? 0 : 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: EASE_EMIL },
    },
  };

  return (
    <section className="relative z-0 border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 md:px-8 md:pb-32 md:pt-24">
        <motion.div
          initial="oculto"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={contenedor}
        >
          <motion.p
            variants={pieza}
            className="max-w-[42ch] text-sm text-foreground/80 md:text-base"
          >
            La red se sostiene entre tres roles.
          </motion.p>
          <motion.h2
            variants={pieza}
            className="mt-3 max-w-2xl font-serif text-3xl font-medium text-foreground [text-wrap:balance] md:text-4xl"
          >
            Elige cómo{" "}
            <span className="italic text-primary-ink">participar</span>
          </motion.h2>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {ROLES.map((rol, indice) => (
            <TarjetaRol
              key={rol.numero}
              rol={rol}
              indice={indice}
              sinMovimiento={sinMovimiento}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
