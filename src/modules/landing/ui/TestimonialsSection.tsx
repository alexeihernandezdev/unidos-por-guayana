import Link from "next/link";
import { ArrowUpRight, MessageSquareQuote } from "lucide-react";
import { TestimonioCard } from "@/modules/testimonios/ui";
import { listarTestimoniosPublicosServicio } from "@/shared/testimonios";

export async function TestimonialsSection() {
  const testimonios = await listarTestimoniosPublicosServicio({
    destacados: true,
    take: 6,
  });

  if (testimonios.length === 0) return null;

  return (
    <section id="testimonios" className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
        <div className="grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-3 text-sm text-primary-ink">
              <MessageSquareQuote className="size-5" strokeWidth={1.5} aria-hidden />
              Voces de la comunidad
            </div>
            <h2 className="mt-5 max-w-3xl font-serif text-4xl font-medium leading-[0.98] tracking-[-0.03em] md:text-6xl [text-wrap:balance]">
              La confianza también se construye contando lo vivido.
            </h2>
          </div>
          <Link
            href="/testimonios"
            className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary-ink"
          >
            Ver todas las historias
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} aria-hidden />
          </Link>
        </div>

        <div className="panel-stagger mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {testimonios.map((testimonio) => (
            <TestimonioCard
              key={testimonio.id}
              testimonio={testimonio}
              headingLevel="h3"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
