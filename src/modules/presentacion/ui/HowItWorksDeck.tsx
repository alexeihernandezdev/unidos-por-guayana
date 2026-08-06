"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  AnimatePresence,
  DeckBackground,
  DotNav,
  Eyebrow,
  KineticHeading,
  ProgressBar,
  Rise,
  Chip,
  motion,
  useReducedMotion,
  EASE,
  beat,
} from "./DeckPrimitives";
import { SLIDES, type SlideDef } from "./DeckSlides";

const TOTAL = SLIDES.length;

export function HowItWorksDeck() {
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const quieto = useReducedMotion() === true;
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const goTo = useCallback(
    (destino: number) => {
      setState(([actual]) => {
        const clamped = Math.max(0, Math.min(TOTAL - 1, destino));
        if (clamped === actual) return [actual, 0];
        return [clamped, clamped > actual ? 1 : -1];
      });
    },
    [],
  );

  // Ref espejo del índice para que los handlers de teclado/gesto no se recreen.
  const indexRef = useRef(index);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const next = useCallback(() => goTo(indexRef.current + 1), [goTo]);
  const prev = useCallback(() => goTo(indexRef.current - 1), [goTo]);

  // Navegación por teclado.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(TOTAL - 1);
      } else if (/^[1-9]$/.test(e.key)) {
        goTo(Number(e.key) - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goTo]);

  // Sync con el hash (#N, 1-based) para deep-link y salto directo.
  useEffect(() => {
    const fromHash = Number(window.location.hash.replace("#", ""));
    if (Number.isFinite(fromHash) && fromHash >= 1 && fromHash <= TOTAL) {
      // Salto inicial desde el hash (deep-link). Arrancamos en 0 en el render
      // para no romper la hidratación y reposicionamos al montar en cliente.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      goTo(fromHash - 1);
    }
    // solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const target = `#${index + 1}`;
    if (window.location.hash !== target) {
      window.history.replaceState(null, "", target);
    }
  }, [index]);

  const def = SLIDES[index];

  return (
    <div
      className="relative flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground select-none"
      role="group"
      aria-roledescription="presentación"
      aria-label="Cómo funciona Unidos por La Guaira"
      onPointerDown={(e) => {
        swipe.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const s = swipe.current;
        swipe.current = null;
        if (!s) return;
        const dx = e.clientX - s.x;
        const dy = e.clientY - s.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          if (dx < 0) next();
          else prev();
        }
      }}
    >
      <DeckBackground />
      <ProgressBar progreso={(index + 1) / TOTAL} />

      {/* Barra superior: wordmark + salida. */}
      <header className="relative z-20 flex shrink-0 items-center justify-between px-5 py-4 md:px-10 md:py-6">
        <span className="flex items-center gap-2.5 font-serif text-[15px] tracking-tight text-foreground/90">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/20 text-primary-ink">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
              <path
                d="M12 21s-7-4.35-9.5-9C1 8.5 3 5 6.5 5 9 5 12 8 12 8s3-3 5.5-3C21 5 23 8.5 21.5 12 19 16.65 12 21 12 21Z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
          </span>
          Unidos por La Guaira
        </span>
        <Link
          href="/"
          className="focus-ring flex items-center gap-1.5 rounded-full border border-border/70 bg-card/50 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        >
          Salir <X className="size-3.5" strokeWidth={2} />
        </Link>
      </header>

      {/* Escenario de diapositivas. */}
      <div className="relative z-10 min-h-0 flex-1">
        <AnimatePresence custom={dir} initial={false}>
          <motion.div
            key={def.id}
            custom={dir}
            variants={{
              enter: (d: number) =>
                quieto
                  ? { opacity: 0 }
                  : { opacity: 0, x: d > 0 ? 70 : -70, scale: 0.985 },
              center: { opacity: 1, x: 0, scale: 1 },
              exit: (d: number) =>
                quieto
                  ? { opacity: 0 }
                  : { opacity: 0, x: d > 0 ? -70 : 70, scale: 0.985 },
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: quieto ? 0.15 : 0.55, ease: EASE }}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden"
          >
            <SlideView def={def} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles inferiores. */}
      <footer className="relative z-20 flex shrink-0 items-center justify-between gap-4 px-5 py-4 md:px-10 md:py-6">
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70 md:block">
          ← → para navegar
        </span>
        <div className="flex-1 md:flex md:justify-center">
          <DotNav total={TOTAL} index={index} onGo={goTo} />
        </div>
        <div className="flex items-center gap-2">
          <NavArrow dir="prev" onClick={prev} disabled={index === 0} />
          <NavArrow dir="next" onClick={next} disabled={index === TOTAL - 1} />
        </div>
      </footer>

      {/* Región viva para lectores de pantalla. */}
      <p className="sr-only" aria-live="polite">
        Diapositiva {index + 1} de {TOTAL}: {def.eyebrow}
      </p>
    </div>
  );
}

function NavArrow({
  dir,
  onClick,
  disabled,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Anterior" : "Siguiente"}
      className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-border bg-card/60 text-foreground backdrop-blur transition-all hover:border-primary/50 hover:text-primary-ink disabled:pointer-events-none disabled:opacity-30 active:scale-95"
    >
      <Icon className="size-4" strokeWidth={2} />
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Render de una diapositiva según su `kind`.
   ──────────────────────────────────────────────────────────────────────── */
function SlideView({ def }: { def: SlideDef }) {
  if (def.kind === "cover") return <CoverSlide def={def} />;
  if (def.kind === "closing") return <ClosingSlide def={def} />;
  if (def.kind === "statement") return <StatementSlide def={def} />;
  return <StandardSlide def={def} />;
}

function ChipRow({ chips, delay }: { chips?: string[]; delay: number }) {
  if (!chips?.length) return null;
  return (
    <Rise delay={delay} className="mt-7 flex flex-wrap gap-2">
      {chips.map((c) => (
        <Chip key={c}>{c}</Chip>
      ))}
    </Rise>
  );
}

function CoverSlide({ def }: { def: SlideDef }) {
  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center">
      <Eyebrow delay={beat(0)}>{def.eyebrow}</Eyebrow>
      <KineticHeading
        text={def.title}
        accent={def.accent}
        delay={beat(1)}
        className="mt-6 justify-center text-[clamp(3.2rem,12vw,9rem)]"
      />
      <Rise delay={beat(5)} className="mt-7 max-w-[52ch]">
        <p className="text-balance text-base leading-relaxed text-muted-foreground md:text-xl">
          {def.body}
        </p>
      </Rise>
      <Rise delay={beat(7)} className="mt-10">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-primary-ink">
          <motion.span
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="size-4" strokeWidth={1.8} />
          </motion.span>
          Desliza o usa las flechas
        </span>
      </Rise>
    </div>
  );
}

function StatementSlide({ def }: { def: SlideDef }) {
  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col justify-center px-6 md:px-10">
      <Eyebrow delay={beat(0)}>{def.eyebrow}</Eyebrow>
      <KineticHeading
        text={def.title}
        accent={def.accent}
        delay={beat(1)}
        className="mt-6 text-[clamp(2.4rem,7vw,5.5rem)]"
      />
      <Rise delay={beat(6)} className="mt-8 max-w-[58ch]">
        <p className="text-lg leading-relaxed text-muted-foreground md:text-2xl">
          {def.body}
        </p>
      </Rise>
      <ChipRow chips={def.chips} delay={beat(8)} />
    </div>
  );
}

function ClosingSlide({ def }: { def: SlideDef }) {
  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center">
      <Eyebrow delay={beat(0)}>{def.eyebrow}</Eyebrow>
      <KineticHeading
        text={def.title}
        accent={def.accent}
        delay={beat(1)}
        className="mt-6 justify-center text-[clamp(2.4rem,7vw,5.5rem)]"
      />
      <Rise delay={beat(7)} className="mt-8 max-w-[54ch]">
        <p className="text-balance text-base leading-relaxed text-muted-foreground md:text-xl">
          {def.body}
        </p>
      </Rise>
      <Rise delay={beat(9)} className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/transparencia"
          className="focus-ring inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
        >
          Ver la transparencia pública
          <ArrowRight className="size-4" strokeWidth={2} />
        </Link>
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-foreground transition-colors hover:border-primary/50 hover:text-primary-ink"
        >
          Ir al inicio
        </Link>
      </Rise>
    </div>
  );
}

function StandardSlide({ def }: { def: SlideDef }) {
  const Mock = def.Mock;
  return (
    <div className="mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-8 px-6 py-6 md:px-10 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-5">
        <Eyebrow delay={beat(0)}>{def.eyebrow}</Eyebrow>
        <KineticHeading
          text={def.title}
          accent={def.accent}
          delay={beat(1)}
          className="mt-5 text-[clamp(2rem,4.8vw,3.6rem)]"
        />
        <Rise delay={beat(5)} className="mt-6 max-w-[46ch]">
          <p className="text-[15px] leading-relaxed text-muted-foreground md:text-lg">
            {def.body}
          </p>
        </Rise>
        <ChipRow chips={def.chips} delay={beat(6)} />
      </div>
      <div className="lg:col-span-7">
        {Mock ? (
          <div className="mx-auto w-full max-w-[520px]">
            <Mock />
          </div>
        ) : null}
      </div>
    </div>
  );
}
