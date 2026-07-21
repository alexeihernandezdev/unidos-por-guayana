import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type Props = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  footer: ReactNode;
  wide?: boolean;
};

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
  footer,
  wide = false,
}: Props) {
  return (
    <main className="auth-shell">
      <section className="auth-visual" aria-label="Coordinación comunitaria en La Guaira">
        <Image
          src="/assets/help5.jpg"
          alt="Vecinos organizan y descargan suministros para su comunidad."
          fill
          priority
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="object-cover object-[58%_center]"
        />
        <div className="auth-visual-overlay" aria-hidden />

        <Link href="/" className="auth-wordmark focus-ring">
          <Image src="/logo-mark.svg" alt="" width={32} height={32} />
          <span>
            <span className="italic text-white/65">Unidos por</span>{" "}
            <strong className="font-semibold text-white">la Guaira</strong>
          </span>
        </Link>

        <div className="auth-visual-copy" data-auth-rise>
          <blockquote>
            La ayuda llega más lejos cuando cada persona encuentra cómo acercarse.
          </blockquote>
          <div className="auth-location">
            <span aria-hidden />
            <p>La Guaira · Venezuela</p>
          </div>
        </div>
      </section>

      <section className="auth-content">
        <div className={`auth-content-inner ${wide ? "max-w-[46rem]" : "max-w-[27rem]"}`} data-auth-rise>
          <Link href="/" className="auth-back focus-ring">
            <ArrowLeft aria-hidden size={16} strokeWidth={1.8} />
            Volver al inicio
          </Link>

          <header className="mb-8">
            {eyebrow ? (
              <p className="font-mono text-[0.6875rem] font-medium uppercase text-primary">
                {eyebrow}
              </p>
            ) : null}
            <h1
              className={`font-serif text-[clamp(2.25rem,5vw,3.25rem)] font-medium leading-[0.98] text-foreground ${eyebrow ? "mt-3" : ""}`}
            >
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-lg text-[0.9375rem] leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </header>

          {children}

          <div className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </section>
    </main>
  );
}
