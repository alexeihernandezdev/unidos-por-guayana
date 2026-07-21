import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, MessageSquareQuote } from "lucide-react";
import { TestimonioCard } from "@/modules/testimonios/ui";
import {
  contarTestimoniosPublicosServicio,
  listarTestimoniosPublicosServicio,
} from "@/shared/testimonios";
import { Button } from "@/shared/ui/button";

export const metadata: Metadata = {
  title: "Testimonios | Unidos por la Guaira",
  description:
    "Historias verificadas de colaboradores y solicitantes que forman parte de la red de ayuda comunitaria.",
};

const POR_PAGINA = 12;

type Props = {
  searchParams: Promise<{ pagina?: string }>;
};

export default async function TestimoniosPublicosPage({ searchParams }: Props) {
  const params = await searchParams;
  const solicitada = Number.parseInt(params.pagina ?? "1", 10);
  const pagina = Number.isFinite(solicitada) && solicitada > 0 ? solicitada : 1;
  const [testimonios, total] = await Promise.all([
    listarTestimoniosPublicosServicio({
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
    }),
    contarTestimoniosPublicosServicio(),
  ]);
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  if (total > 0 && pagina > paginas) {
    redirect(`/testimonios?pagina=${paginas}`);
  }

  return (
    <main className="w-full flex-1">
      <header className="border-b border-border bg-primary-ink text-primary-foreground">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-24">
          <div className="flex items-center gap-3 text-sm text-white/70">
            <MessageSquareQuote className="size-5" strokeWidth={1.5} aria-hidden />
            Historias de la comunidad
          </div>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl font-medium leading-[0.95] tracking-[-0.035em] text-white md:text-7xl [text-wrap:balance]">
            Personas que encontraron una red dispuesta a responder.
          </h1>
          <p className="mt-6 max-w-[60ch] text-base leading-7 text-white/75 [text-wrap:pretty]">
            Cada testimonio fue enviado por un miembro de la comunidad y revisado antes de publicarse.
          </p>
          <Button asChild className="mt-8 min-h-11 bg-white text-primary-ink hover:bg-white/90">
            <Link href="/mis-testimonios">Compartir mi historia</Link>
          </Button>
        </div>
      </header>

      <section aria-labelledby="archivo-testimonios" className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-24">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <h2 id="archivo-testimonios" className="text-2xl font-semibold tracking-tight">
              Archivo de testimonios
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {total} {total === 1 ? "historia publicada" : "historias publicadas"}
            </p>
          </div>
          <span className="font-mono text-xs text-muted-foreground numeric-tnum">
            Página {Math.min(pagina, paginas)} de {paginas}
          </span>
        </div>

        {testimonios.length > 0 ? (
          <div className="panel-stagger grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {testimonios.map((testimonio) => (
              <TestimonioCard
                key={testimonio.id}
                testimonio={testimonio}
                headingLevel="h3"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center">
            <MessageSquareQuote className="size-10 text-primary-ink" strokeWidth={1.5} aria-hidden />
            <h2 className="mt-5 text-xl font-semibold">Aún no hay testimonios publicados</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Las primeras historias aparecerán aquí después de su revisión.
            </p>
          </div>
        )}

        {paginas > 1 ? (
          <nav aria-label="Paginación de testimonios" className="mt-10 flex items-center justify-between border-t border-border pt-6">
            {pagina > 1 ? (
              <Button asChild variant="outline">
                <Link href={`/testimonios?pagina=${pagina - 1}`}>
                  <ArrowLeft strokeWidth={1.5} aria-hidden />
                  Anterior
                </Link>
              </Button>
            ) : <span />}
            {pagina < paginas ? (
              <Button asChild variant="outline">
                <Link href={`/testimonios?pagina=${pagina + 1}`}>
                  Siguiente
                  <ArrowRight strokeWidth={1.5} aria-hidden />
                </Link>
              </Button>
            ) : null}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
