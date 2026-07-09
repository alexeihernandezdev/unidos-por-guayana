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
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-[5fr_7fr] md:items-start md:gap-16">
          {/* Imagen editorial ancla: le da peso físico a los números. */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-muted">
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
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="hairline w-8" aria-hidden />
              <span>Garantías del sistema</span>
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-foreground [text-wrap:balance] md:text-4xl md:tracking-tight">
              Los números que sí podemos prometer.
            </h2>
            <p className="mt-6 max-w-[52ch] text-base text-foreground/85 [text-wrap:pretty]">
              Todavía no publicamos toneladas entregadas ni cuántas personas
              recibieron ayuda. Esas cifras llegarán con el tablero público en
              vivo. Mientras tanto, esto es lo que ya está garantizado por
              diseño.
            </p>

            <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 md:gap-y-14">
              {metrics.map((metric) => (
                <div key={metric.label} className="flex flex-col" data-reveal>
                  <div className="hairline" aria-hidden />
                  <dt className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {metric.label}
                  </dt>
                  <dd
                    className="numeric-tnum mt-3 font-mono text-5xl font-medium text-foreground md:text-6xl"
                    style={{
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                  >
                    {metric.value}
                  </dd>
                  <p className="mt-4 max-w-[28ch] text-sm text-foreground/85 [text-wrap:pretty]">
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
