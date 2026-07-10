import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

export function HeroSection() {
  return (
    <section className="relative border-b border-border">
      {/* Full-bleed cinematográfico: la foto ocupa todo el hero. El bloque de
          texto flota sobre ella con overlay diagonal para garantizar contraste. */}
      <div className="relative min-h-[620px] w-full overflow-hidden md:min-h-[760px]">
        <Image
          src="/assets/help1.webp"
          alt="Región central de Venezuela, contexto del terremoto del 24 de junio de 2026."
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Overlay diagonal: negro profundo a la izquierda (donde vive el texto),
            se desvanece hacia la derecha para dejar respirar la fotografía.
            Contraste garantizado en todo el bloque tipográfico. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20"
        />
        {/* Segunda capa vertical: refuerza legibilidad en la banda superior
            donde vive el chip de operación y en el pie. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40"
        />
        {/* Halo ocre superior derecho: firma cromática de marca sin invadir
            texto. Screen-blend para que se lea sobre la foto sin ensuciarla. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full opacity-70"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.14 75 / 0.55), transparent 65%)",
            mixBlendMode: "screen",
          }}
        />

        <div className="relative mx-auto flex min-h-[620px] max-w-6xl items-center px-6 py-20 md:min-h-[760px] md:px-8 md:py-32">
          <div className="max-w-2xl">
            {/* Metadatos operativos: chip primary sobre fondo dark (contraste
                garantizado por el bg-primary/25 sólido) + fecha y región en
                blanco/70 con tracking. */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/75">
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/60 bg-primary/25 px-2 py-0.5 text-white backdrop-blur-sm">
                <span
                  aria-hidden
                  className="inline-block size-1.5 rounded-full bg-primary"
                />
                <span>Operación activa</span>
              </span>
              <span className="numeric-tnum text-white/85">24 · 06 · 2026</span>
              <span aria-hidden className="h-3 w-px bg-white/30" />
              <span>Región central</span>
            </div>

            <h1
              data-landing-rise
              className="mt-6 font-serif text-[2.5rem] font-medium text-white [text-wrap:balance] md:text-[4rem]"
              style={{
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                textShadow: "0 2px 24px oklch(0 0 0 / 0.35)",
              }}
            >
              Que la ayuda{" "}
              <span className="relative inline-block text-primary">
                <span className="relative z-10">llegue</span>
                {/* Trazo ocre bajo la palabra clave, aplicado a un solo
                    momento del titular. */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 z-0 h-3 bg-primary/30 md:h-4"
                  style={{ borderRadius: "999px 999px 999px 4px" }}
                />
              </span>
              .
              <br />
              <span className="text-white/95">Y que se pueda comprobar.</span>
            </h1>

            <p
              data-landing-rise
              style={{
                ["--rise-delay" as string]: "80ms",
                textShadow: "0 1px 12px oklch(0 0 0 / 0.35)",
              }}
              className="mt-8 max-w-[54ch] text-base text-white/90 [text-wrap:pretty] md:text-lg md:leading-relaxed"
            >
              Coordinamos suministros, transporte y voluntarios desde La Guaira
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
                className="focus-ring border-white/40 bg-white/10 text-white backdrop-blur-sm transition-transform duration-[120ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white/20 hover:text-white active:scale-[0.97]"
              >
                <Link href="/registro?rol=SOLICITANTE">Necesito ayuda</Link>
              </Button>
            </div>

            {/* Pie del hero: pista visual + procedencia. Lee como firma
                editorial, no como scaffolding. */}
            <div
              data-landing-rise
              style={{ ["--rise-delay" as string]: "220ms" }}
              className="mt-16 hidden items-center gap-3 md:flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-px w-10 bg-white/40" aria-hidden />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">
                La Guaira · Venezuela
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
