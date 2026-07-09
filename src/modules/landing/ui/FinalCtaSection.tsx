import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function FinalCtaSection() {
  return (
    <section className="relative border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.15fr_0.85fr] md:items-center md:gap-16 md:px-8 md:py-24">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <span className="hairline w-8" aria-hidden />
            <span>Suma tu parte</span>
          </div>
          <h2 className="mt-3 font-serif text-3xl font-medium text-foreground [text-wrap:balance] md:text-[3rem]"
            style={{ letterSpacing: "-0.015em", lineHeight: 1.08 }}
          >
            Cada envío que sale{" "}
            <span className="text-primary-ink">necesita a alguien.</span>
          </h2>
          <p className="mt-8 max-w-[54ch] text-base text-foreground/85 [text-wrap:pretty] md:text-lg md:leading-relaxed">
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
              className="focus-ring transition-transform duration-[120ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]"
            >
              <Link href="/registro?rol=SOLICITANTE">Necesito ayuda</Link>
            </Button>
          </div>
        </div>

        {/* Bloque editorial de cierre: imagen ancla + números que ya prometimos,
            no cifras inventadas de impacto. */}
        <aside
          aria-label="Recordatorio del contexto"
          className="relative overflow-hidden rounded-md border border-border bg-card"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
            <Image
              src="/assets/help2.jpg"
              alt="Contexto de la operación desde Guayana."
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
              <div className="numeric-tnum font-mono text-[11px] uppercase tracking-[0.14em] text-white/80">
                Evento · 24 · 06 · 2026
              </div>
              <p className="mt-2 text-base font-semibold text-white md:text-lg">
                La coordinación no espera.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 p-6 md:p-8">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Trazable
              </p>
              <p className="numeric-tnum mt-2 font-mono text-3xl font-medium text-foreground md:text-4xl">
                100%
              </p>
            </div>
            <div className="border-l border-border pl-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Comisión
              </p>
              <p className="numeric-tnum mt-2 font-mono text-3xl font-medium text-foreground md:text-4xl">
                0%
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
