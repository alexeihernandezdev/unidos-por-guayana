import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

type Props = {
  etiqueta: string;
  valor: number;
  subtitulo?: string;
  href: string;
};

export function TarjetaMetrica({ etiqueta, valor, subtitulo, href }: Props) {
  return (
    <Link
      href={href}
      className="focus-ring group flex flex-col gap-2 rounded-lg border border-border p-5 transition-colors duration-150 hover:bg-muted/40"
    >
      <span className="text-xs text-foreground/70">{etiqueta}</span>
      <span className="numeric-tnum font-mono text-3xl font-medium text-foreground">
        {valor}
      </span>
      {subtitulo ? (
        <span className="text-xs text-muted-foreground">{subtitulo}</span>
      ) : null}
      <span className="inline-flex items-center gap-1 text-xs text-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        Ver listado
        <ArrowRightIcon strokeWidth={1.5} className="size-3" />
      </span>
    </Link>
  );
}
