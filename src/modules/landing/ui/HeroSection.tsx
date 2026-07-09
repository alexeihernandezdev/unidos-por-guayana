import Image from "next/image";
import Link from "next/link";
import { MapPin, Package } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-20 md:px-8 md:pt-16 md:pb-24">
        <div className="grid gap-12 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-14">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary-ink">
                <span
                  aria-hidden
                  className="inline-block size-1.5 rounded-full bg-primary"
                />
                <span>Operación activa</span>
              </span>
              <span className="numeric-tnum">24 · 06 · 2026</span>
              <span aria-hidden className="h-3 w-px bg-border" />
              <span>Región central</span>
            </div>
            <h1
              data-landing-rise
              className="mt-5 font-serif text-[2.25rem] font-medium text-foreground [text-wrap:balance] md:text-[3.5rem]"
              style={{
                lineHeight: 1.05,
                letterSpacing: "-0.015em",
              }}
            >
              Que la ayuda llegue.{" "}
              <span className="text-primary-ink">
                Y que se pueda comprobar.
              </span>
            </h1>
            <p
              data-landing-rise
              style={{ ["--rise-delay" as string]: "80ms" }}
              className="mt-8 max-w-[58ch] text-base text-foreground/85 [text-wrap:pretty] md:text-lg md:leading-relaxed"
            >
              Coordinamos suministros, transporte y voluntarios desde Guayana
              hacia las zonas afectadas por el terremoto. Cada aporte queda
              registrado.
            </p>
            <div
              data-landing-rise
              style={{ ["--rise-delay" as string]: "160ms" }}
              className="mt-10 flex flex-wrap gap-3"
            >
              <Button
                asChild
                size="lg"
                className="focus-ring transition-transform duration-[120ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]"
              >
                <Link href="/registro?rol=COLABORADOR">Quiero colaborar</Link>
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

          <div
            data-landing-rise
            style={{ ["--rise-delay" as string]: "120ms" }}
            className="relative"
          >
            {/* Figura principal: la imagen habla; overlay reducido a
                metadatos operativos en las esquinas, no a un cartel. */}
            <figure className="relative aspect-[4/5] w-full overflow-hidden rounded-md border border-border bg-muted">
              <Image
                src="/assets/help1.webp"
                alt="Región central de Venezuela, contexto del terremoto del 24 de junio de 2026."
                fill
                priority
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
              />
              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 md:p-5">
                <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm bg-black/65 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                  <span
                    aria-hidden
                    className="inline-block size-1.5 rounded-full bg-primary"
                  />
                  <span>En operación</span>
                </span>
                <span className="shrink-0 whitespace-nowrap rounded-sm bg-black/65 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                  Venezuela
                </span>
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 text-white md:p-6">
                <span className="numeric-tnum font-mono text-[11px] uppercase tracking-[0.14em] text-white/80">
                  Evento · 24 · 06 · 2026
                </span>
                <span className="text-base font-semibold md:text-lg">
                  Terremoto en la región central.
                </span>
                <span className="max-w-[36ch] text-sm text-white/80 [text-wrap:pretty]">
                  Respuesta coordinada desde Guayana: suministros, transporte y
                  voluntariado.
                </span>
              </figcaption>
            </figure>

            {/* Preview flotante de la forma final de un envío. Datos etiquetados
                como muestra; no oculta el pie de la figura principal. */}
            <div
              aria-label="Vista previa de un envío"
              className="absolute -top-5 -right-3 hidden w-64 overflow-hidden rounded-md border border-border bg-card sm:block md:-top-6 md:-right-6"
            >
              <div className="relative aspect-[16/9] w-full bg-muted">
                <Image
                  src="/assets/help2.jpg"
                  alt="Kits de suministros preparados para envío a Vargas."
                  fill
                  sizes="256px"
                  className="object-cover"
                />
                <span className="absolute right-2 top-2 rounded-sm bg-black/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                  Muestra
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin
                      aria-hidden
                      strokeWidth={1.5}
                      className="size-3"
                    />
                    <span>Vargas</span>
                  </span>
                  <span>ENV-001</span>
                </div>
                <p className="mt-2 text-base font-semibold text-foreground">
                  Recolectando
                </p>
                <div className="mt-3 flex justify-between font-mono text-[11px] text-muted-foreground">
                  <span className="numeric-tnum text-foreground">68%</span>
                  <span className="numeric-tnum">3d restantes</span>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: "68%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
