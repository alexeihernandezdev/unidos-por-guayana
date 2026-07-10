import Image from "next/image";

type Principle = {
  title: string;
  body: string;
  imagen: string;
  alt: string;
};

const featured: Principle = {
  title: "Todo queda a la vista",
  body: "Cualquiera puede ver qué se recolectó, cuánto falta y a dónde fue cada envío. El tablero público muestra el estado real de la operación.",
  imagen: "/assets/help7.avif",
  alt: "Tablero público mostrando el estado de los envíos en curso.",
};

const supporting: Principle[] = [
  {
    title: "Cada aporte se rastrea",
    body: "Del punto de acopio hasta la entrega, con evidencia. Los envíos avanzan por estados registrados uno por uno.",
    imagen: "/assets/help4.avif",
    alt: "Cadena de custodia de un envío humanitario.",
  },
  {
    title: "La app no cobra",
    body: "Las donaciones en dinero se hacen por canales externos (transferencia, Zelle, PayPal). Aquí solo se registran los montos, para transparencia.",
    imagen: "/assets/help6.avif",
    alt: "Registro de aportes recibidos por canales externos.",
  },
];

export function TrustSection() {
  return (
    <section
      id="transparencia"
      className="relative overflow-hidden border-t border-border bg-muted"
    >
      {/* Watermark dot-map denso: da textura de territorio al bloque de confianza. */}
      <div
        aria-hidden
        className="dot-map-dense pointer-events-none absolute inset-0 opacity-50"
      />
      <div className="relative mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end md:gap-12">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="hairline w-8" aria-hidden />
              <span>Transparencia</span>
            </div>
            <h2 className="mt-3 font-serif text-4xl font-medium text-foreground [text-wrap:balance] md:text-[3rem]"
              style={{ letterSpacing: "-0.02em", lineHeight: 1.05 }}
            >
              Por qué puedes confiar.
            </h2>
          </div>
          <p className="max-w-[56ch] text-base text-foreground/85 [text-wrap:pretty] md:text-lg md:leading-relaxed">
            La confianza no es una promesa. Es una consecuencia de cómo está
            diseñado el sistema. Estas son las reglas que no cambian.
          </p>
        </div>

        {/* Bento asimétrico: featured mayor a la izquierda con imagen dominante,
            dos principios apilados a la derecha con imagen lateral. Rompe la
            rejilla de 3 tarjetas idénticas de las secciones anteriores. */}
        <div className="mt-14 grid gap-6 md:mt-16 md:grid-cols-[1.35fr_1fr] md:gap-8">
          <article className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
              <Image
                src={featured.imagen}
                alt={featured.alt}
                fill
                sizes="(min-width: 768px) 55vw, 100vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-1 flex-col p-8 md:p-10">
              <h3 className="font-serif text-3xl font-medium text-foreground [text-wrap:balance] md:text-[2.25rem]"
                style={{ letterSpacing: "-0.015em", lineHeight: 1.1 }}
              >
                {featured.title}
              </h3>
              <p className="mt-5 max-w-[54ch] text-base text-foreground/85 [text-wrap:pretty]">
                {featured.body}
              </p>
              <div className="mt-8">
                <div className="hairline" aria-hidden />
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Tablero público · próximamente
                </p>
              </div>
            </div>
          </article>

          <div className="grid gap-6 md:gap-8">
            {supporting.map((p) => (
              <article
                key={p.title}
                className="group relative flex overflow-hidden rounded-md border border-border bg-card"
              >
                <div className="relative w-2/5 shrink-0 overflow-hidden bg-muted">
                  <Image
                    src={p.imagen}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 768px) 18vw, 40vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center p-6 md:p-7">
                  <h3 className="text-lg font-semibold text-foreground [text-wrap:balance] md:text-xl md:tracking-tight">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm text-foreground/85 [text-wrap:pretty] md:text-base">
                    {p.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
