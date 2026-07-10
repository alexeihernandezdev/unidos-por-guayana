import Image from "next/image";

type Metric = {
  value: string;
  label: string;
  hint: string;
};

const metrics: Metric[] = [
  {
    value: "4",
    label: "Regiones destino",
    hint: "Caracas, Vargas, Aragua y otras zonas afectadas.",
  },
  {
    value: "3",
    label: "Tipos de recurso",
    hint: "Suministros, transporte y personal voluntario.",
  },
  {
    value: "100%",
    label: "Trazable",
    hint: "Cada aporte queda registrado y visible en el tablero.",
  },
  {
    value: "0%",
    label: "Comisión",
    hint: "La app no cobra ni procesa pagos. Nada se retiene.",
  },
];

export function NumbersSection() {
  return (
    <section className="relative border-t border-border overflow-hidden">
      {/* Watermark dot-map: sensación de territorio detrás de los números. */}
      <div
        aria-hidden
        className="dot-map pointer-events-none absolute inset-0 opacity-60"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-32">
        <div className="grid gap-12 md:grid-cols-[5fr_7fr] md:items-start md:gap-16">
          {/* Imagen editorial ancla: le da peso físico a los números. */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-muted shadow-[0_30px_60px_-24px_oklch(0.22_0.012_60/0.25)]">
            <Image
              src="/assets/help1.webp"
              alt="Región central de Venezuela, contexto de la operación."
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 font-mono text-[11px] uppercase tracking-[0.14em] text-white/90 md:p-8">
              <span>Región central</span>
              <span>Venezuela · 2026</span>
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="hairline w-8" aria-hidden />
              <span>Garantías del sistema</span>
            </div>
            <h2 className="mt-3 font-serif text-4xl font-medium text-foreground [text-wrap:balance] md:text-[3rem]"
              style={{ letterSpacing: "-0.02em", lineHeight: 1.05 }}
            >
              Los números que sí podemos prometer.
            </h2>
            <p className="mt-6 max-w-[52ch] text-base text-foreground/85 [text-wrap:pretty] md:text-lg md:leading-relaxed">
              Todavía no publicamos toneladas entregadas ni cuántas personas
              recibieron ayuda. Esas cifras llegarán con el tablero público en
              vivo. Mientras tanto, esto es lo que ya está garantizado por
              diseño.
            </p>

            {/* Grid 2x2 con hairlines internas (no bordes de card): las
                cifras respiran sobre el fondo del section. */}
            <dl className="mt-14 grid grid-cols-2">
              {metrics.map((metric, i) => (
                <div
                  key={metric.label}
                  data-reveal
                  className={
                    "flex flex-col py-8 md:py-10 " +
                    // hairline vertical entre columnas
                    (i % 2 === 0 ? "pr-6 md:pr-10" : "border-l border-border pl-6 md:pl-10") +
                    // hairline horizontal entre filas
                    (i >= 2 ? " border-t" : "")
                  }
                >
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {metric.label}
                  </dt>
                  <dd
                    className="numeric-oldstyle mt-3 font-serif text-6xl font-medium text-primary-ink md:text-7xl lg:text-[5.5rem]"
                    style={{
                      letterSpacing: "-0.03em",
                      lineHeight: 0.95,
                    }}
                  >
                    {metric.value}
                  </dd>
                  <p className="mt-5 max-w-[28ch] text-sm text-foreground/80 [text-wrap:pretty]">
                    {metric.hint}
                  </p>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
