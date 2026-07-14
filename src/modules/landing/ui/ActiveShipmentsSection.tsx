"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin, PackageCheck, Users } from "lucide-react";
import {
  cubicBezier,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

type Estado = "Recolectando" | "Casi listo" | "En tránsito";

type Envio = {
  destino: string;
  zona: string;
  meta: string;
  progreso: number;
  estado: Estado;
  detalle: string;
  confirmado: string;
  pendiente: string;
  actualizacion: string;
  imagen: string;
  alt: string;
};

const ENVIOS: Envio[] = [
  {
    destino: "Vargas",
    zona: "Litoral central",
    meta: "1.500 kits de suministros",
    progreso: 68,
    estado: "Recolectando",
    detalle: "42 colaboradores activos",
    confirmado: "1.020 kits confirmados",
    pendiente: "480 por reunir",
    actualizacion: "Hoy · 10:45",
    imagen: "/assets/help3.webp",
    alt: "Kits de suministros humanitarios organizados para envío a Vargas.",
  },
  {
    destino: "Caracas",
    zona: "La Vega",
    meta: "8 camiones de logística",
    progreso: 91,
    estado: "Casi listo",
    detalle: "5 empresas participan",
    confirmado: "7 camiones confirmados",
    pendiente: "1 por coordinar",
    actualizacion: "Hoy · 09:20",
    imagen: "/assets/help4.avif",
    alt: "Camiones preparados para transportar ayuda hacia Caracas.",
  },
  {
    destino: "Aragua",
    zona: "Maracay",
    meta: "35 voluntarios de campo",
    progreso: 34,
    estado: "Recolectando",
    detalle: "12 personas inscritas",
    confirmado: "12 cupos cubiertos",
    pendiente: "23 por sumar",
    actualizacion: "Ayer · 18:30",
    imagen: "/assets/help5.jpg",
    alt: "Voluntarios coordinando trabajo de campo en Aragua.",
  },
];

const RESUMEN = [
  { valor: "03", etiqueta: "actividades abiertas" },
  { valor: "64%", etiqueta: "avance promedio" },
  { valor: "59", etiqueta: "personas y aliados" },
] as const;

const ESTADO: Record<Estado, string> = {
  Recolectando: "border-primary/55 bg-primary/20 text-teal-50",
  "Casi listo": "border-amber-300/55 bg-amber-300/15 text-amber-100",
  "En tránsito": "border-sky-300/55 bg-sky-300/15 text-sky-100",
};

const easeScroll = cubicBezier(0.45, 0, 0.55, 1);

/**
 * Escena editorial de actividades demostrativas. El contenido permanece
 * local para conservar el prerender estático de la landing; el parallax vive
 * en este client leaf y solo anima transform/opacity.
 */
export function ActiveShipmentsSection() {
  const seccionRef = useRef<HTMLElement>(null);
  const sinMovimiento = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({
    target: seccionRef,
    offset: ["start end", "start 0.18"],
  });

  const introY = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? [0, 0] : [150, 0],
    { ease: easeScroll },
  );
  const introOpacidad = useTransform(
    scrollYProgress,
    [0, 0.28],
    sinMovimiento ? [1, 1] : [0, 1],
  );
  const numeroY = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? [0, 0] : [180, -40],
  );
  const lineaEscala = useTransform(
    scrollYProgress,
    [0.18, 0.72],
    sinMovimiento ? [1, 1] : [0, 1],
  );

  return (
    <section
      ref={seccionRef}
      id="envios"
      className="relative overflow-hidden border-t border-white/10 bg-[oklch(0.19_0.045_194)] text-white"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,oklch(0.48_0.11_194/0.28),transparent_32%),radial-gradient(circle_at_8%_72%,oklch(0.38_0.08_185/0.18),transparent_30%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:72px_72px]"
      />
      <motion.span
        aria-hidden
        style={{ y: numeroY }}
        className="pointer-events-none absolute -right-8 top-0 select-none font-serif text-[clamp(15rem,38vw,34rem)] leading-none text-white/[0.035] will-change-transform"
      >
        64%
      </motion.span>

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-36">
        <motion.div
          style={{ y: introY, opacity: introOpacidad }}
          className="will-change-transform"
        >
          <div className="grid items-end gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
            <div>
              <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
                <span className="h-px w-10 bg-primary" aria-hidden />
                Operación en curso
              </div>
              <h2 className="mt-7 max-w-4xl font-serif text-[clamp(3.25rem,7vw,6.5rem)] font-medium leading-[0.88] tracking-[-0.035em] text-white [text-wrap:balance]">
                Ayuda que ya está
                <span className="block italic text-primary"> en movimiento.</span>
              </h2>
            </div>

            <div className="lg:pb-2">
              <p className="max-w-[48ch] text-base leading-relaxed text-white/72 [text-wrap:pretty] md:text-lg">
                Cada destino concentra personas, recursos y decisiones. Este es
                un ejemplo del tablero que permitirá seguir el avance sin perder
                de vista lo que todavía hace falta.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  href="/transparencia"
                  className="focus-ring group inline-flex min-h-11 items-center gap-3 rounded-full bg-white px-5 text-sm font-semibold text-[oklch(0.19_0.045_194)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Ver trazabilidad pública
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
                  Datos demostrativos
                </span>
              </div>
            </div>
          </div>

          <div className="mt-16 grid border-y border-white/15 sm:grid-cols-3 md:mt-20">
            {RESUMEN.map((metrica, indice) => (
              <div
                key={metrica.etiqueta}
                className="flex items-baseline justify-between gap-5 border-white/15 py-5 sm:block sm:px-7 sm:py-7 sm:first:pl-0 sm:[&:not(:last-child)]:border-r"
              >
                <span className="numeric-tnum font-serif text-4xl font-medium text-white md:text-5xl">
                  {metrica.valor}
                </span>
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
                  {metrica.etiqueta}
                </span>
                {indice === 0 ? (
                  <span className="sr-only">Los datos son ejemplos.</span>
                ) : null}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          aria-hidden
          style={{ scaleX: lineaEscala }}
          className="mt-14 h-px origin-left bg-gradient-to-r from-primary via-white/30 to-transparent md:mt-20"
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-12 lg:grid-rows-2">
          {ENVIOS.map((envio, indice) => (
            <ShipmentCard
              key={envio.destino}
              envio={envio}
              indice={indice}
              destacada={indice === 0}
              sinMovimiento={sinMovimiento}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShipmentCard({
  envio,
  indice,
  destacada,
  sinMovimiento,
}: {
  envio: Envio;
  indice: number;
  destacada: boolean;
  sinMovimiento: boolean;
}) {
  const tarjetaRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: tarjetaRef,
    offset: ["start 0.8", "start 0.26"],
  });

  const desplazamientosX = [0, 170, -130] as const;
  const desplazamientosY = [190, 80, 110] as const;
  const desplazamientoX = desplazamientosX[indice] ?? 0;
  const desplazamientoY = desplazamientosY[indice] ?? 0;
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? [0, 0] : [desplazamientoX, 0],
    { ease: easeScroll },
  );
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? [0, 0] : [desplazamientoY, 0],
    { ease: easeScroll },
  );
  const escala = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? [1, 1] : [destacada ? 0.88 : 0.9, 1],
    { ease: easeScroll },
  );
  const opacidad = useTransform(
    scrollYProgress,
    [0, 0.3],
    sinMovimiento ? [1, 1] : [0, 1],
  );
  const imagenY = useTransform(
    scrollYProgress,
    [0, 1],
    sinMovimiento ? ["0%", "0%"] : ["-5%", "5%"],
  );
  const progreso = useTransform(
    scrollYProgress,
    [0.16, 0.74],
    sinMovimiento ? [envio.progreso / 100, envio.progreso / 100] : [0, envio.progreso / 100],
  );

  return (
    <motion.article
      ref={tarjetaRef}
      style={{ x, y, scale: escala, opacity: opacidad }}
      className={
        "group relative isolate min-h-[430px] overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/[0.06] shadow-[0_32px_90px_-35px_rgb(0_0_0/0.85)] will-change-transform " +
        (destacada
          ? "lg:col-span-7 lg:row-span-2 lg:min-h-[720px]"
          : "lg:col-span-5 lg:min-h-[350px]")
      }
    >
      <motion.div
        style={{ y: imagenY }}
        className="absolute inset-x-0 -top-[8%] h-[116%] will-change-transform"
      >
        <Image
          src={envio.imagen}
          alt={envio.alt}
          fill
          sizes={destacada ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 42vw, 100vw"}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.035]"
        />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative z-10 flex h-full min-h-[inherit] flex-col p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <EstadoPill estado={envio.estado} />
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.13em] text-white/65">
            <Clock3 aria-hidden className="size-3.5" />
            {envio.actualizacion}
          </span>
        </div>

        <div className="mt-auto pt-16">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.17em] text-white/65">
            <MapPin aria-hidden className="size-3.5 text-primary" />
            {envio.destino} · {envio.zona}
          </div>
          <h3
            className={
              "mt-3 max-w-[14ch] font-serif font-medium leading-[0.98] tracking-[-0.025em] text-white [text-wrap:balance] " +
              (destacada ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl")
            }
          >
            {envio.meta}
          </h3>

          <div className={destacada ? "mt-8 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end" : "mt-6"}>
            <div>
              <div className="flex items-end justify-between gap-5">
                <span className="numeric-tnum font-serif text-5xl font-medium leading-none text-white">
                  {envio.progreso}%
                </span>
                <span className="pb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">
                  avance confirmado
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={`Progreso de la actividad hacia ${envio.destino}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={envio.progreso}
                className="mt-4 h-1 overflow-hidden rounded-full bg-white/20"
              >
                <motion.div
                  aria-hidden
                  style={{ scaleX: progreso }}
                  className="h-full origin-left rounded-full bg-primary"
                />
              </div>
            </div>

            {destacada ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-white/15 pt-5 text-sm text-white/72 sm:grid-cols-1 sm:border-l sm:border-t-0 sm:pl-7 sm:pt-0">
                <span className="inline-flex items-center gap-2">
                  <PackageCheck aria-hidden className="size-4 text-primary" />
                  {envio.confirmado}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Users aria-hidden className="size-4 text-primary" />
                  {envio.detalle}
                </span>
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-white/15 pt-4 text-xs text-white/65">
                <span>{envio.confirmado}</span>
                <span className="text-white/90">{envio.pendiente}</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </motion.article>
  );
}

function EstadoPill({ estado }: { estado: Estado }) {
  return (
    <span
      className={
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] backdrop-blur-md " +
        ESTADO[estado]
      }
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current shadow-[0_0_12px_currentColor]" />
      {estado}
    </span>
  );
}
