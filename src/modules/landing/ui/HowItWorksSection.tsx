import Image from "next/image";

type Step = {
  role: string;
  title: string;
  body: string;
  imagen: string;
  alt: string;
};

const steps: Step[] = [
  {
    role: "Colaborador",
    title: "Colaboras",
    body: "Sumas suministros, un camión, tu tiempo o una donación a un envío en curso hasta completar sus metas.",
    imagen: "/assets/help6.avif",
    alt: "Manos organizando suministros para donación.",
  },
  {
    role: "Solicitante",
    title: "Solicitas",
    body: "Pides ayuda para tu sector: qué se necesita, qué tan urgente y dónde llegar.",
    imagen: "/assets/help7.avif",
    alt: "Persona señalando una región afectada en un mapa.",
  },
  {
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
      className="border-t border-border bg-background"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
        <div className="grid gap-8 md:grid-cols-[1fr_1.6fr] md:gap-16">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="hairline w-8" aria-hidden />
              <span>Roles</span>
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-foreground [text-wrap:balance] md:text-4xl md:tracking-tight">
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

        {/* Stepper editorial: columnas con imagen dominante vertical,
            unidas por una hairline superior. Sin cards, sin numeración
            decorativa. La secuencia se lee de izquierda a derecha. */}
        <div className="mt-16 md:mt-20">
          <div className="hairline" aria-hidden />
          <div className="grid grid-cols-1 gap-10 pt-10 md:grid-cols-3 md:gap-8 md:pt-12">
            {steps.map((step) => (
              <article
                key={step.title}
                className="flex flex-col"
                data-reveal
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-muted">
                  <Image
                    src={step.imagen}
                    alt={step.alt}
                    fill
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {step.role}
                </div>
                <h3 className="mt-2 text-xl font-semibold text-foreground md:text-2xl md:tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-[36ch] text-base text-foreground/85 [text-wrap:pretty]">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
