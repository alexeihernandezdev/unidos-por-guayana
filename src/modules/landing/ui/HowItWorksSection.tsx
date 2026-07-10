import Image from "next/image";

type Step = {
  index: string;
  role: string;
  title: string;
  body: string;
  imagen: string;
  alt: string;
};

const steps: Step[] = [
  {
    index: "01",
    role: "Colaborador",
    title: "Colaboras",
    body: "Sumas suministros, un camión, tu tiempo o una donación a un envío en curso hasta completar sus metas.",
    imagen: "/assets/help6.avif",
    alt: "Manos organizando suministros para donación.",
  },
  {
    index: "02",
    role: "Solicitante",
    title: "Solicitas",
    body: "Pides ayuda para tu sector: qué se necesita, qué tan urgente y dónde llegar.",
    imagen: "/assets/help7.avif",
    alt: "Persona señalando una región afectada en un mapa.",
  },
  {
    index: "03",
    role: "Administrador",
    title: "El equipo coordina",
    body: "Los administradores definen los envíos, sus metas y deciden cuándo sale cada uno.",
    imagen: "/assets/help5.jpg",
    alt: "Equipo coordinando envíos desde un centro de acopio.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="relative border-t border-border bg-background"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-32">
        <div className="grid gap-8 md:grid-cols-[1fr_1.6fr] md:gap-16">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="hairline w-8" aria-hidden />
              <span>Roles</span>
            </div>
            <h2 className="mt-3 font-serif text-4xl font-medium text-foreground [text-wrap:balance] md:text-[3rem]"
              style={{ letterSpacing: "-0.02em", lineHeight: 1.05 }}
            >
              Tres formas
              <br />
              de participar.
            </h2>
          </div>
          <p className="max-w-[58ch] text-base text-foreground/85 [text-wrap:pretty] md:text-lg md:leading-relaxed">
            Cada persona que llega tiene un rol. La plataforma conecta a los
            tres para que un envío salga con lo que necesita, cuando lo
            necesita, hacia donde lo necesita.
          </p>
        </div>

        {/* Timeline vertical: línea central en desktop, izquierda en móvil.
            Cada paso alterna lado (imagen izq/der) para lectura editorial.
            La secuencia es real (roles distintos), por lo que los índices
            01/02/03 no son scaffolding decorativo (constitución lo permite). */}
        <div className="relative mt-20 md:mt-28">
          {/* Línea vertical: hairline en izquierda (mobile) o centro (desktop). */}
          <div
            aria-hidden
            className="absolute left-4 top-0 h-full w-px bg-border md:left-1/2 md:-translate-x-1/2"
          />

          <ol className="space-y-16 md:space-y-28">
            {steps.map((step, i) => (
              <TimelineStep key={step.title} step={step} align={i % 2 === 0 ? "left" : "right"} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function TimelineStep({
  step,
  align,
}: {
  step: Step;
  align: "left" | "right";
}) {
  const imageOnLeft = align === "left";

  return (
    <li className="relative" data-reveal>
      {/* Nodo circular sobre la línea: ocre ancla + halo suave. */}
      <div
        aria-hidden
        className="absolute left-4 top-3 z-10 -translate-x-1/2 md:left-1/2"
      >
        <div className="relative flex size-5 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-primary/25" />
          <span className="relative size-2.5 rounded-full bg-primary" />
        </div>
      </div>

      <div
        className={
          "grid gap-6 pl-12 md:grid-cols-2 md:gap-16 md:pl-0 " +
          (imageOnLeft ? "" : "md:[&>*:first-child]:order-2")
        }
      >
        {/* Imagen: aspecto vertical, sin bordes duros, sombra sutil. */}
        <div className={imageOnLeft ? "md:pr-12" : "md:pl-12"}>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-muted shadow-[0_20px_40px_-16px_oklch(0.22_0.012_60/0.20)]">
            <Image
              src={step.imagen}
              alt={step.alt}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Contenido: índice serif gigante + rol + título + cuerpo. */}
        <div
          className={
            "flex flex-col justify-center " +
            (imageOnLeft ? "md:pl-12" : "md:pr-12 md:text-right md:items-end")
          }
        >
          <span
            className="numeric-oldstyle font-serif text-6xl font-medium text-primary-ink md:text-7xl"
            style={{ lineHeight: 1, letterSpacing: "-0.02em" }}
          >
            {step.index}
          </span>
          <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {step.role}
          </div>
          <h3 className="mt-2 font-serif text-3xl font-medium text-foreground [text-wrap:balance] md:text-4xl"
            style={{ letterSpacing: "-0.015em", lineHeight: 1.1 }}
          >
            {step.title}
          </h3>
          <p className="mt-5 max-w-[38ch] text-base text-foreground/85 [text-wrap:pretty]">
            {step.body}
          </p>
        </div>
      </div>
    </li>
  );
}
