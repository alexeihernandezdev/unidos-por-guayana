"use client";

import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, type ReactNode } from "react";

// Curva "de agua que reposa" del sistema (ease-out-emil, ver globals.css).
export const EASE = [0.23, 1, 0.32, 1] as const;
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/** Delay helper para encadenar entradas sin repetir números mágicos. */
export const beat = (n: number) => 0.14 + n * 0.075;

/* ────────────────────────────────────────────────────────────────────────
   Fondo atmosférico del deck. Tres auroras teal que derivan lentamente sobre
   el petróleo (encima de los glows del tema panel), una viñeta y una malla de
   territorio en dot-grid. Todo pointer-events-none y gated por reduced-motion.
   ──────────────────────────────────────────────────────────────────────── */
export function DeckBackground() {
  const quieto = useReducedMotion() === true;
  const drift = (
    dur: number,
    a: [number, number],
    b: [number, number],
  ) =>
    quieto
      ? {}
      : {
          animate: { x: [a[0], b[0], a[0]], y: [a[1], b[1], a[1]] },
          transition: { duration: dur, ease: "easeInOut" as const, repeat: Infinity },
        };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Malla de territorio: dot-grid teal-claro (visible sobre el petróleo)
          con máscara radial para que se disuelva hacia los bordes. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(oklch(0.72 0.05 200 / 0.10) 1px, transparent 1.4px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 70% 70% at 50% 40%, black, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at 50% 40%, black, transparent 78%)",
        }}
      />
      {/* Auroras. Blur alto + mix-blend screen para que "enciendan". */}
      <motion.div
        {...drift(26, [0, 0], [40, 30])}
        className="absolute -left-[10%] -top-[15%] h-[55vmax] w-[55vmax] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(circle, oklch(0.62 0.13 195 / 0.30), transparent 62%)",
          filter: "blur(28px)",
          mixBlendMode: "screen",
        }}
      />
      <motion.div
        {...drift(32, [0, 0], [-50, 40])}
        className="absolute -right-[12%] top-[6%] h-[48vmax] w-[48vmax] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(circle, oklch(0.58 0.11 210 / 0.26), transparent 62%)",
          filter: "blur(30px)",
          mixBlendMode: "screen",
        }}
      />
      <motion.div
        {...drift(38, [0, 0], [30, -40])}
        className="absolute -bottom-[20%] left-[25%] h-[52vmax] w-[52vmax] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(circle, oklch(0.55 0.12 185 / 0.22), transparent 64%)",
          filter: "blur(34px)",
          mixBlendMode: "screen",
        }}
      />
      {/* Viñeta para anclar el contenido al centro. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 45%, transparent 40%, oklch(0.16 0.02 220 / 0.55) 100%)",
        }}
      />
      {/* Grano editorial fino (mismo recurso que el resto del sistema). */}
      <div className="editorial-grain absolute inset-0" />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Eyebrow: etiqueta mono con un filete que se expande.
   ──────────────────────────────────────────────────────────────────────── */
export function Eyebrow({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const quieto = useReducedMotion() === true;
  return (
    <div className="flex items-center gap-3">
      <motion.span
        initial={quieto ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay, duration: 0.6, ease: EASE_EXPO }}
        className="block h-px w-8 origin-left bg-primary/70"
      />
      <motion.span
        initial={quieto ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.08, duration: 0.5, ease: EASE }}
        className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary-ink"
      >
        {children}
      </motion.span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Titular cinético: cada palabra sube y desenfoca a foco, en cascada. La parte
   marcada con `accent` va en itálica teal (mismo tratamiento que el hero).
   ──────────────────────────────────────────────────────────────────────── */
export function KineticHeading({
  text,
  accent,
  delay = 0,
  className = "",
}: {
  text: string;
  accent?: string;
  delay?: number;
  className?: string;
}) {
  const quieto = useReducedMotion() === true;
  const palabras: { w: string; italic: boolean }[] = [
    ...text.split(" ").map((w) => ({ w, italic: false })),
    ...(accent ? accent.split(" ").map((w) => ({ w, italic: true })) : []),
  ];

  return (
    <h2
      className={`flex flex-wrap gap-x-[0.28em] gap-y-1 font-serif font-medium leading-[0.94] tracking-[-0.03em] text-foreground ${className}`}
    >
      {palabras.map(({ w, italic }, idx) => (
        <span
          key={idx}
          className="inline-block overflow-hidden pb-[0.08em] align-bottom"
        >
          <motion.span
            initial={quieto ? false : { y: "108%", opacity: 0, filter: "blur(6px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: delay + idx * 0.075, duration: 0.72, ease: EASE_EXPO }}
            className={`inline-block will-change-transform ${
              italic ? "italic text-primary-ink" : ""
            }`}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </h2>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Fade-rise genérico para cuerpo, chips y bloques secundarios.
   ──────────────────────────────────────────────────────────────────────── */
export function Rise({
  children,
  delay = 0,
  y = 18,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const quieto = useReducedMotion() === true;
  return (
    <motion.div
      initial={quieto ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Chip/etiqueta de módulo. */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground backdrop-blur-sm">
      {children}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   CountUp: anima un número entero al montar (respeta reduced-motion).
   ──────────────────────────────────────────────────────────────────────── */
export function CountUp({
  to,
  duration = 1.4,
  delay = 0,
  suffix = "",
  prefix = "",
}: {
  to: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
}) {
  const quieto = useReducedMotion() === true;
  const mv = useMotionValue(quieto ? to : 0);
  const rounded = useTransform(mv, (v) =>
    `${prefix}${Math.round(v).toLocaleString("es-VE")}${suffix}`,
  );
  useEffect(() => {
    if (quieto) return;
    const controls = animate(mv, to, { duration, delay, ease: EASE });
    return () => controls.stop();
  }, [mv, to, duration, delay, quieto]);
  return <motion.span>{rounded}</motion.span>;
}

/* ────────────────────────────────────────────────────────────────────────
   Barra de progreso superior: se llena por tramos (scaleX GPU).
   ──────────────────────────────────────────────────────────────────────── */
export function ProgressBar({ progreso }: { progreso: number }) {
  return (
    <div className="absolute inset-x-0 top-0 z-30 h-[3px] bg-white/[0.06]">
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-primary/70 via-primary to-accent"
        style={{ scaleX: progreso }}
        initial={false}
        animate={{ scaleX: progreso }}
        transition={{ duration: 0.5, ease: EASE }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Navegación por puntos + contador. Indicador activo con layoutId compartido.
   ──────────────────────────────────────────────────────────────────────── */
export function DotNav({
  total,
  index,
  onGo,
}: {
  total: number;
  index: number;
  onGo: (i: number) => void;
}) {
  return (
    <div className="pointer-events-auto flex items-center gap-4">
      <span className="font-mono text-[11px] tabular-nums tracking-[0.1em] text-muted-foreground">
        <span className="text-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>{" "}
        / {String(total).padStart(2, "0")}
      </span>
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onGo(i)}
            aria-label={`Ir a la diapositiva ${i + 1}`}
            aria-current={i === index}
            className="focus-ring group relative grid h-4 place-items-center"
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-1.5 bg-transparent"
                  : "w-1.5 bg-muted-foreground/40 group-hover:bg-muted-foreground/80"
              }`}
            />
            {i === index && (
              <motion.span
                layoutId="dot-activo"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="absolute h-1.5 w-5 rounded-full bg-primary"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export { AnimatePresence, motion, useReducedMotion };
