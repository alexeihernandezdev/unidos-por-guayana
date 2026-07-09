import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

type Estado = "Recolectando" | "Casi listo" | "En tránsito";

type Envio = {
  destino: string;
  meta: string;
  progreso: number;
  estado: Estado;
  detalle: string;
  imagen: string;
  alt: string;
};

const envios: Envio[] = [
  {
    destino: "Vargas",
    meta: "1.500 kits de suministros",
    progreso: 68,
    estado: "Recolectando",
    detalle: "42 colaboradores activos",
    imagen: "/assets/help3.webp",
    alt: "Kits de suministros humanitarios organizados para envío a Vargas.",
  },
  {
    destino: "Caracas · La Vega",
    meta: "8 camiones · logística",
    progreso: 91,
    estado: "Casi listo",
    detalle: "5 empresas participan",
    imagen: "/assets/help4.avif",
    alt: "Camiones preparados para logística de ayuda hacia Caracas.",
  },
  {
    destino: "Aragua · Maracay",
    meta: "35 voluntarios de campo",
    progreso: 34,
    estado: "Recolectando",
    detalle: "12 personas inscritas",
    imagen: "/assets/help5.jpg",
    alt: "Voluntarios coordinando trabajo de campo en Aragua.",
  },
];

// Estilos sobre card (fondo claro): tinted, buen contraste.
const estadoOnCard: Record<Estado, string> = {
  Recolectando: "border-primary/40 bg-primary/15 text-primary-ink",
  "Casi listo": "border-accent/40 bg-accent/15 text-accent",
  "En tránsito": "border-foreground/25 bg-foreground/10 text-foreground",
};

// Estilos sobre imagen: fondo oscuro semi-opaco + texto blanco. Legible en
// cualquier foto sin depender del tono del pixel debajo.
const estadoOnImage: Record<Estado, string> = {
  Recolectando: "border-primary/50 bg-black/60 text-primary",
  "Casi listo": "border-accent/50 bg-black/60 text-accent",
  "En tránsito": "border-white/30 bg-black/60 text-white",
};

export function ActiveShipmentsSection() {
  const [featured, ...rest] = envios;

  return (
    <section id="envios" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="hairline w-8" aria-hidden />
              <span>Panel · envíos</span>
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-foreground [text-wrap:balance] md:text-4xl md:tracking-tight">
              Envíos en curso
            </h2>
            <p className="mt-4 max-w-[58ch] text-base text-foreground/85 [text-wrap:pretty]">
              Cada envío tiene un destino, unas metas y un progreso público. Así
              se verá el tablero cuando esté en vivo. Los ejemplos de abajo
              muestran la forma final.
            </p>
          </div>
          <Link
            href="#transparencia"
            className="focus-ring inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors duration-150 hover:text-accent"
          >
            <span className="underline-sweep">
              Cómo funciona la trazabilidad
            </span>
            <ArrowUpRight
              aria-hidden
              strokeWidth={1.5}
              className="size-4"
            />
          </Link>
        </div>

        {/* Bento asimétrico: 1 destacado grande + 2 apilados a la derecha.
            Rompe el patrón de "3 cards iguales" y le da peso editorial al
            envío con más colaboradores activos. */}
        <div className="mt-14 grid gap-6 md:grid-cols-[1.35fr_1fr] md:gap-8">
          <ShipmentFeatured envio={featured} />
          <div className="grid gap-6 md:gap-8">
            {rest.map((envio) => (
              <ShipmentStacked key={envio.destino} envio={envio} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ShipmentFeatured({ envio }: { envio: Envio }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card">
      {/* Imagen dominante: la card se lee como pieza editorial, no como tile. */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={envio.imagen}
          alt={envio.alt}
          fill
          sizes="(min-width: 768px) 55vw, 100vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.02]"
          priority={false}
        />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span
            className={
              "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] backdrop-blur-sm " +
              estadoOnImage[envio.estado]
            }
          >
            <span
              aria-hidden
              className="inline-block size-1.5 rounded-full bg-current"
            />
            <span className="whitespace-nowrap">{envio.estado}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 md:p-8">
        <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <MapPin aria-hidden strokeWidth={1.5} className="size-3" />
          <span>{envio.destino}</span>
        </div>
        <h3 className="mt-3 text-xl font-semibold text-foreground [text-wrap:balance] md:text-2xl md:tracking-tight">
          {envio.meta}
        </h3>

        <div className="mt-8">
          <div className="flex items-baseline justify-between">
            <span className="numeric-tnum font-mono text-3xl font-medium text-foreground md:text-4xl">
              {envio.progreso}%
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              de la meta
            </span>
          </div>
          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700"
              style={{ width: `${envio.progreso}%` }}
              aria-label={`Progreso ${envio.progreso}%`}
            />
          </div>
        </div>

        <div className="mt-auto pt-8">
          <div className="hairline" aria-hidden />
          <p className="mt-4 text-sm text-foreground/85">{envio.detalle}</p>
        </div>
      </div>
    </article>
  );
}

function ShipmentStacked({ envio }: { envio: Envio }) {
  return (
    <article className="group relative flex overflow-hidden rounded-md border border-border bg-card">
      <div className="relative aspect-square w-2/5 shrink-0 overflow-hidden bg-muted sm:w-1/3 md:w-2/5">
        <Image
          src={envio.imagen}
          alt={envio.alt}
          fill
          sizes="(min-width: 768px) 22vw, 40vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <MapPin aria-hidden strokeWidth={1.5} className="size-3" />
            <span>{envio.destino}</span>
          </div>
          <span
            className={
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] " +
              estadoOnCard[envio.estado]
            }
          >
            <span
              aria-hidden
              className="inline-block size-1.5 rounded-full bg-current"
            />
            {envio.estado}
          </span>
        </div>
        <h3 className="mt-2 text-base font-semibold text-foreground [text-wrap:balance] md:text-lg md:tracking-tight">
          {envio.meta}
        </h3>

        <div className="mt-auto pt-5">
          <div className="flex items-baseline justify-between">
            <span className="numeric-tnum font-mono text-base font-medium text-foreground">
              {envio.progreso}%
            </span>
            <span className="text-[11px] text-muted-foreground">
              {envio.detalle}
            </span>
          </div>
          <div className="mt-2 h-[2px] w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${envio.progreso}%` }}
              aria-label={`Progreso ${envio.progreso}%`}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
