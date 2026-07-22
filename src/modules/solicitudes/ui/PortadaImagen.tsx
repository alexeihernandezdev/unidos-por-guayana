"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";

// Imagen de portada con loader: muestra un skeleton mientras carga y funde la imagen
// al terminar. El contenedor padre debe ser `relative` (la imagen usa `fill`). El
// skeleton usa `motion-safe:animate-pulse` para degradar a bloque estático con
// `prefers-reduced-motion`. Feature 033.
type Props = {
  src: string;
  alt: string;
  sizes: string;
  /** Clases extra para la imagen (p. ej. `group-hover:scale-[1.04]`). */
  className?: string;
};

export function PortadaImagen({ src, alt, sizes, className }: Props) {
  const [cargada, setCargada] = useState(false);

  return (
    <>
      {!cargada && (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-muted motion-safe:animate-pulse"
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        onLoad={() => setCargada(true)}
        className={cn(
          "object-cover transition-[opacity,transform] duration-300 ease-[var(--ease-out-emil)]",
          cargada ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}
