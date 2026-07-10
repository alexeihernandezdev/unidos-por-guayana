import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function FinalCtaSection() {
  return (
    <section className="relative border-t border-border">
      {/* Full-bleed cinematográfico: la foto ocupa toda la sección; el bloque
          de texto flota sobre ella con vidrio cálido. Referencia: hero final
          del tour Japón. */}
      <div className="relative min-h-[560px] w-full overflow-hidden md:min-h-[680px]">
        <Image
          src="/assets/help2.jpg"
          alt="Contexto de la operación desde La Guaira hacia las zonas afectadas."
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Overlay diagonal: sombra profunda a la izquierda para lectura del
            bloque de texto; se desvanece a la derecha para dejar respirar la
            foto. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/15"
        />
        {/* Halo ocre en esquina superior derecha: firma cromática de la marca. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[440px] w-[440px] rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.14 75 / 0.55), transparent 65%)",
            mixBlendMode: "screen",
          }}
        />

        <div className="relative mx-auto flex min-h-[560px] max-w-6xl items-center px-6 py-20 md:min-h-[680px] md:px-8 md:py-32">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/75">
              <span className="h-px w-8 bg-white/40" aria-hidden />
              <span>Suma tu parte</span>
            </div>

            <h2
              className="mt-4 font-serif text-4xl font-medium text-white [text-wrap:balance] md:text-[3.75rem]"
              style={{ letterSpacing: "-0.02em", lineHeight: 1.02 }}
            >
              Cada envío que sale{" "}
              <span className="relative inline-block text-primary">
                necesita
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-3 bg-primary/30 md:h-4"
                  style={{ borderRadius: "999px 999px 999px 4px" }}
                />
              </span>{" "}
              a alguien.
            </h2>

            <p className="mt-8 max-w-[54ch] text-base text-white/85 [text-wrap:pretty] md:text-lg md:leading-relaxed">
              Puedes aportar suministros, un camión, tiempo o una donación. O
              pedir ayuda para tu sector. Basta con dar un paso.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="focus-ring transition-transform duration-[120ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]"
              >
                <Link
                  href="/registro?rol=COLABORADOR"
                  className="inline-flex items-center gap-2"
                >
                  <span>Quiero colaborar</span>
                  <ArrowRight
                    aria-hidden
                    strokeWidth={1.75}
                    className="size-4"
                  />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="focus-ring border-white/40 bg-white/10 text-white backdrop-blur-sm transition-transform duration-[120ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white/20 active:scale-[0.97]"
              >
                <Link href="/registro?rol=SOLICITANTE">Necesito ayuda</Link>
              </Button>
            </div>

            {/* Franja de números clave sobre la imagen: cierre editorial de la
                landing. Hairlines verticales blancas para lectura sobre foto. */}
            <div className="mt-14 flex flex-wrap items-end gap-x-10 gap-y-6 md:mt-20 md:gap-x-14">
              <MetricOverlay value="100%" label="Trazable" />
              <MetricOverlay value="0%" label="Comisión" />
              <MetricOverlay
                value="24 · 06 · 2026"
                label="Evento"
                mono
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricOverlay({
  value,
  label,
  mono = false,
}: {
  value: string;
  label: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col border-l border-white/25 pl-4 md:pl-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">
        {label}
      </span>
      <span
        className={
          "numeric-tnum mt-2 font-medium text-white " +
          (mono
            ? "font-mono text-lg md:text-xl"
            : "font-serif text-4xl md:text-5xl")
        }
        style={mono ? undefined : { letterSpacing: "-0.02em", lineHeight: 1 }}
      >
        {value}
      </span>
    </div>
  );
}
