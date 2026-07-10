import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    heading: "Participar",
    links: [
      { label: "Quiero colaborar", href: "/registro?rol=COLABORADOR" },
      { label: "Necesito ayuda", href: "/registro?rol=SOLICITANTE" },
      { label: "Ya tengo cuenta", href: "/login" },
    ],
  },
  {
    heading: "El proyecto",
    links: [
      { label: "Cómo funciona", href: "#como-funciona" },
      { label: "Actividades en curso", href: "#envios" },
      { label: "Transparencia", href: "/transparencia" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Alcance del proyecto", href: "#transparencia" },
      { label: "Contacto", href: "mailto:contacto@unidosporlaguaira.org" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-16">
          <div>
            <div className="inline-flex items-center gap-3 leading-none">
              <Image
                src="/logo-mark.svg"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-base font-semibold tracking-tight text-foreground">
                Unidos por la Guaira
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground [text-wrap:pretty]">
              Apoyo logístico comunitario para la ayuda humanitaria que sale
              desde La Guaira. No sustituye a Protección Civil ni a
              organismos oficiales. No procesamos pagos: la ayuda monetaria se
              canaliza por fuera de la app.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {column.heading}
              </p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="focus-ring underline-sweep text-sm text-foreground/80 transition-colors duration-150 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 md:flex-row md:items-center">
          <p className="text-xs text-muted-foreground">
            © 2026 Unidos por la Guaira. Iniciativa comunitaria sin fines de
            lucro.
          </p>
          <p className="numeric-tnum font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Terremoto · 24 · 06 · 2026 · región central
          </p>
        </div>
      </div>
    </footer>
  );
}
