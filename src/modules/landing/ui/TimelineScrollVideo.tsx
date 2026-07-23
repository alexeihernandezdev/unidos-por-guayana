"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useLenis } from "lenis/react";
import Snap from "lenis/snap";
import { calcularFotograma, interpolar } from "./timelineScroll";

// La secuencia se extrae de public/videos/timeline.mp4 a 24 fps (WebP 1280px).
// Dibujar imágenes ya decodificadas en un canvas evita el "seek" del decodificador
// H.264, que es lo que hacía saltar el scrubbing con currentTime.
const TOTAL_FOTOGRAMAS = 216;
// Lenis (SmoothScroll) ya aporta la inercia del gesto, así que el canvas puede
// seguir al objetivo con firmeza; el mezclado entre fotogramas elimina el
// "escalón" residual entre imágenes consecutivas.
const FACTOR_SUAVIZADO = 0.2; // qué tan rápido alcanza el fotograma objetivo
const EPSILON = 0.01; // umbral para detener el bucle de animación

const rutaFotograma = (indice: number) =>
  `/videos/timeline-frames/frame_${String(indice + 1).padStart(3, "0")}.webp`;

const ETAPAS = [
  {
    numero: "01",
    titulo: "Caja abierta",
    descripcion:
      "Todo comienza con espacio para reunir lo necesario: agua, alimentos y botiquines.",
    // Ventanas de aparición sobre el progreso de scroll (0..1), afinadas al
    // contenido real del video: caja → sellado → carga en la furgoneta.
    ventana: [0, 0.05, 0.24, 0.31],
  },
  {
    numero: "02",
    titulo: "Caja preparada",
    descripcion: "Cada aporte se organiza, se sella y queda listo para salir.",
    ventana: [0.34, 0.42, 0.56, 0.63],
  },
  {
    numero: "03",
    titulo: "Envío en camino",
    descripcion:
      "La ayuda deja el centro de acopio y avanza hacia su destino.",
    ventana: [0.66, 0.74, 0.87, 0.95],
  },
] as const;

// Punto de reposo de cada etapa (centro de su meseta de opacidad); el scroll se
// ancla a estos hitos, más el cierre, para que la narración se sienta por escenas.
const CENTROS_SNAP = ETAPAS.map((e) => (e.ventana[1] + e.ventana[2]) / 2);
// easeInOutCubic: acelera y desacelera con suavidad al saltar de escena.
const facilitarEntradaSalida = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

type EstadoSecuencia = "cargando" | "listo" | "error";

function dibujarCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  ancho: number,
  alto: number,
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;
  const escala = Math.max(ancho / iw, alto / ih);
  const w = iw * escala;
  const h = ih * escala;
  ctx.drawImage(img, (ancho - w) / 2, (alto - h) / 2, w, h);
}

export function TimelineScrollVideo() {
  const seccionRef = useRef<HTMLElement>(null);
  const cierreRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagenesRef = useRef<HTMLImageElement[]>([]);
  const cargadosRef = useRef<boolean[]>([]);
  const fotogramaActualRef = useRef(0);
  const fotogramaObjetivoRef = useRef(0);
  const cuadroRef = useRef<number | null>(null);
  const arrancarRef = useRef<() => void>(() => {});

  const [estado, setEstado] = useState<EstadoSecuencia>("cargando");
  const [progresoCarga, setProgresoCarga] = useState(0);
  const reducirMovimiento = useReducedMotion() === true;
  const lenis = useLenis();

  const { scrollYProgress } = useScroll({
    target: seccionRef,
    offset: ["start start", "end end"],
  });

  // Localiza el fotograma cargado más cercano a `indice`; si ninguno lo está
  // todavía, devuelve null y el dibujo se omite sin romper la secuencia.
  const fotogramaMasCercano = useCallback((indice: number): number | null => {
    const cargados = cargadosRef.current;
    const objetivo = Math.min(TOTAL_FOTOGRAMAS - 1, Math.max(0, indice));
    if (cargados[objetivo]) return objetivo;
    for (let salto = 1; salto < TOTAL_FOTOGRAMAS; salto += 1) {
      if (cargados[objetivo - salto]) return objetivo - salto;
      if (cargados[objetivo + salto]) return objetivo + salto;
    }
    return null;
  }, []);

  const dibujar = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const posicion = Math.min(
      TOTAL_FOTOGRAMAS - 1,
      Math.max(0, fotogramaActualRef.current),
    );
    const base = Math.floor(posicion);
    const fraccion = posicion - base;
    const indiceBase = fotogramaMasCercano(base);
    if (indiceBase === null) return;
    const imgBase = imagenesRef.current[indiceBase];
    if (!imgBase) return;

    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarCover(ctx, imgBase, canvas.width, canvas.height);

    // Mezcla con el fotograma siguiente según la parte fraccional para que el
    // movimiento sea continuo y no salte de imagen en imagen.
    if (fraccion > 0.01) {
      const indiceSiguiente = fotogramaMasCercano(base + 1);
      if (indiceSiguiente !== null && indiceSiguiente !== indiceBase) {
        const imgSiguiente = imagenesRef.current[indiceSiguiente];
        if (imgSiguiente) {
          ctx.globalAlpha = fraccion;
          dibujarCover(ctx, imgSiguiente, canvas.width, canvas.height);
          ctx.globalAlpha = 1;
        }
      }
    }
  }, [fotogramaMasCercano]);

  // Bucle de animación: interpola el fotograma actual hacia el objetivo y se
  // detiene solo cuando llega, así el scroll a saltos se ve fluido. Se declara
  // dentro del efecto (función hoisted) para poder auto-agendarse sin ciclos.
  useEffect(() => {
    if (reducirMovimiento) {
      arrancarRef.current = () => {};
      return;
    }
    function bucle() {
      const objetivo = fotogramaObjetivoRef.current;
      const actual = interpolar(
        fotogramaActualRef.current,
        objetivo,
        FACTOR_SUAVIZADO,
      );
      fotogramaActualRef.current = actual;
      dibujar();
      if (Math.abs(objetivo - actual) > EPSILON) {
        cuadroRef.current = requestAnimationFrame(bucle);
      } else {
        fotogramaActualRef.current = objetivo;
        dibujar();
        cuadroRef.current = null;
      }
    }
    arrancarRef.current = () => {
      if (cuadroRef.current === null) {
        cuadroRef.current = requestAnimationFrame(bucle);
      }
    };
    return () => {
      if (cuadroRef.current !== null) {
        cancelAnimationFrame(cuadroRef.current);
        cuadroRef.current = null;
      }
    };
  }, [dibujar, reducirMovimiento]);

  useMotionValueEvent(scrollYProgress, "change", (progreso) => {
    fotogramaObjetivoRef.current = calcularFotograma(progreso, TOTAL_FOTOGRAMAS);
    arrancarRef.current();
  });

  // Precarga de la secuencia. El primer fotograma revela la escena cuanto antes;
  // el resto se descarga en segundo plano mientras se muestra el progreso.
  useEffect(() => {
    let activo = true;
    const imagenes: HTMLImageElement[] = [];
    const cargados = new Array<boolean>(TOTAL_FOTOGRAMAS).fill(false);
    let contador = 0;

    for (let i = 0; i < TOTAL_FOTOGRAMAS; i += 1) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (!activo) return;
        cargados[i] = true;
        contador += 1;
        if (i === 0) {
          fotogramaActualRef.current = 0;
          fotogramaObjetivoRef.current = calcularFotograma(
            scrollYProgress.get(),
            TOTAL_FOTOGRAMAS,
          );
          dibujar();
          setEstado((previo) => (previo === "cargando" ? "listo" : previo));
        }
        setProgresoCarga(Math.round((contador / TOTAL_FOTOGRAMAS) * 100));
      };
      img.onerror = () => {
        if (activo && i === 0) setEstado("error");
      };
      img.src = rutaFotograma(i);
      imagenes[i] = img;
    }

    imagenesRef.current = imagenes;
    cargadosRef.current = cargados;
    return () => {
      activo = false;
    };
  }, [dibujar, scrollYProgress]);

  // Ajusta el canvas al contenedor con densidad de píxel real y redibuja.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ajustar = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      dibujar();
    };
    const observador = new ResizeObserver(ajustar);
    observador.observe(canvas);
    ajustar();
    return () => observador.disconnect();
  }, [dibujar]);

  // Anclaje por escenas: al terminar de desplazarse, el scroll se asienta en el
  // punto de reposo de cada etapa (y en el cierre), reproduciendo los fotogramas
  // intermedios de forma fluida. Requiere Lenis (SmoothScroll) y se desactiva con
  // movimiento reducido.
  useEffect(() => {
    if (!lenis || reducirMovimiento) return;
    const seccion = seccionRef.current;
    if (!seccion) return;

    const snap = new Snap(lenis, {
      // proximity: solo se asienta cuando el scroll se detiene cerca de una
      // escena; entre medias el scrubbing queda libre.
      type: "proximity",
      distanceThreshold: "30%",
      duration: 1.1,
      easing: facilitarEntradaSalida,
      debounce: 350,
    });

    let quitar: Array<() => void> = [];
    const construir = () => {
      quitar.forEach((fn) => fn());
      quitar = [];
      const top = seccion.getBoundingClientRect().top + window.scrollY;
      const rango = seccion.offsetHeight - window.innerHeight;
      if (rango <= 0) return;
      for (const centro of CENTROS_SNAP) {
        quitar.push(snap.add(Math.round(top + centro * rango)));
      }
      const cierre = cierreRef.current;
      if (cierre) {
        quitar.push(
          snap.add(Math.round(cierre.getBoundingClientRect().top + window.scrollY)),
        );
      }
    };
    construir();

    let raf = 0;
    const alRedimensionar = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(construir);
    };
    window.addEventListener("resize", alRedimensionar);
    return () => {
      window.removeEventListener("resize", alRedimensionar);
      cancelAnimationFrame(raf);
      quitar.forEach((fn) => fn());
      snap.destroy();
    };
  }, [lenis, reducirMovimiento]);

  const opacidad1 = useTransform(scrollYProgress, [...ETAPAS[0].ventana], [0, 1, 1, 0]);
  const opacidad2 = useTransform(scrollYProgress, [...ETAPAS[1].ventana], [0, 1, 1, 0]);
  const opacidad3 = useTransform(scrollYProgress, [...ETAPAS[2].ventana], [0, 1, 1, 0]);
  const desplazamiento1 = useTransform(opacidad1, [0, 1], [16, 0]);
  const desplazamiento2 = useTransform(opacidad2, [0, 1], [16, 0]);
  const desplazamiento3 = useTransform(opacidad3, [0, 1], [16, 0]);
  const opacidades = [opacidad1, opacidad2, opacidad3];
  const desplazamientos = [desplazamiento1, desplazamiento2, desplazamiento3];

  return (
    <>
      <section
        ref={seccionRef}
        aria-label="Recorrido de una caja de ayuda"
        className="relative h-[460dvh] bg-background text-foreground"
      >
        <div className="sticky top-[var(--altura-header,0rem)] h-[calc(100dvh-var(--altura-header,0rem))] min-h-[32rem] overflow-hidden">
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 size-full"
          />

          {/* Velo de legibilidad: la escena es muy clara, así que un degradado
              del color de fondo desde abajo (y una pizca desde la izquierda)
              sostiene el contraste AA del texto oscuro sin ensuciar la imagen. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, color-mix(in oklch, var(--background) 90%, transparent) 0%, color-mix(in oklch, var(--background) 46%, transparent) 26%, transparent 58%), linear-gradient(to right, color-mix(in oklch, var(--background) 58%, transparent) 0%, transparent 42%)",
            }}
          />

          {/* Chrome superior editorial */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 md:px-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/60">
              Ruta de la ayuda
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/60">
              {reducirMovimiento ? "Vista estática" : "Desliza para avanzar"}
            </span>
          </div>

          {estado === "cargando" ? (
            <div
              role="status"
              className="absolute inset-x-6 bottom-8 z-20 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.14em] text-foreground/70 md:inset-x-8"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
              Preparando la secuencia
              <span className="numeric-tnum text-foreground/50">
                {progresoCarga}%
              </span>
            </div>
          ) : null}

          {estado === "error" ? (
            <div className="absolute inset-0 z-20 grid place-items-center bg-background px-6 text-center">
              <div className="max-w-xl">
                <p className="font-serif text-4xl font-medium tracking-[-0.02em] md:text-6xl">
                  Del acopio al destino
                </p>
                <p className="mx-auto mt-5 max-w-[48ch] text-base leading-7 text-foreground/70">
                  La animación no pudo cargarse, pero el recorrido continúa:
                  reunir, preparar y enviar la ayuda.
                </p>
              </div>
            </div>
          ) : null}

          {/* Rótulos: en movimiento normal se funden en su lugar; con
              movimiento reducido se listan de forma estática y legible. */}
          {estado !== "error" ? (
            reducirMovimiento ? (
              <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-14 md:px-8 md:pb-20">
                <div className="max-w-xl space-y-8">
                  {ETAPAS.map((etapa) => (
                    <div key={etapa.numero}>
                      <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary-ink">
                        {etapa.numero} · de 03
                      </p>
                      <h2 className="mt-2 font-serif text-3xl font-medium leading-[1.02] tracking-[-0.02em] [text-wrap:balance] md:text-4xl">
                        {etapa.titulo}
                      </h2>
                      <p className="mt-2 max-w-[42ch] text-base leading-7 text-foreground/75 [text-wrap:pretty]">
                        {etapa.descripcion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              ETAPAS.map((etapa, indice) => (
                <motion.div
                  key={etapa.numero}
                  aria-hidden={indice !== 0}
                  className="absolute inset-x-0 bottom-0 z-10 px-6 pb-16 md:px-8 md:pb-24"
                  style={{
                    opacity: opacidades[indice],
                    y: desplazamientos[indice],
                  }}
                >
                  <div className="max-w-xl">
                    <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-primary-ink">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                      {etapa.numero} · de 03
                    </p>
                    <h2 className="mt-3 font-serif text-[clamp(2.75rem,7vw,5.25rem)] font-medium leading-[0.95] tracking-[-0.03em] [text-wrap:balance]">
                      {etapa.titulo}
                    </h2>
                    <p className="mt-4 max-w-[40ch] text-base leading-7 text-foreground/80 [text-wrap:pretty] md:text-lg">
                      {etapa.descripcion}
                    </p>
                  </div>
                </motion.div>
              ))
            )
          ) : null}

          {/* Riel de progreso */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 z-20 h-[3px] origin-left bg-primary"
            style={{ scaleX: reducirMovimiento ? 0 : scrollYProgress }}
          />
        </div>
      </section>

      <section
        ref={cierreRef}
        className="bg-background px-6 py-24 text-foreground md:px-8 md:py-32"
      >
        <div className="mx-auto max-w-3xl">
          <p className="font-serif text-4xl font-medium leading-tight tracking-[-0.02em] [text-wrap:balance] md:text-6xl">
            Una caja completa su recorrido cuando la ayuda llega.
          </p>
          <p className="mt-6 max-w-[58ch] text-base leading-7 text-foreground/75 [text-wrap:pretty]">
            Esta ruta es una prueba aislada de la secuencia controlada por
            scroll, dibujada fotograma a fotograma para un desplazamiento fluido.
          </p>
        </div>
      </section>
    </>
  );
}
