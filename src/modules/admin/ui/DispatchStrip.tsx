import { DateTime } from "luxon";

type Props = {
  // Resumen de una línea que se muestra a la derecha de la fecha. Ejemplo:
  // "3 envíos por preparar hoy · 2 solicitudes urgentes". Se construye desde
  // la página consumidora (no calculamos nada aquí).
  resumen?: string;
};

/**
 * Signature del panel: banda de "despacho" en la parte superior de cada página
 * de /panel/*. Fija visualmente que esto es una sala de operaciones — fecha
 * ISO + estado de un vistazo, en Geist Mono con dot ocre que marca "vivo".
 * No es una card: es una fila plana con border-b, para no competir con el
 * contenido debajo.
 */
export function DispatchStrip({ resumen }: Props) {
  // Se formatea en el servidor con zona UTC para evitar hydration mismatch.
  const ahora = DateTime.utc().setLocale("es");
  const fecha = ahora.toFormat("d 'de' LLLL, yyyy");
  const dia = ahora.toFormat("cccc"); // Lunes, Martes…
  const diaCapital = dia.charAt(0).toUpperCase() + dia.slice(1);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3 md:px-8"
    >
      <div className="inline-flex items-center gap-3">
        <span
          aria-hidden
          className="relative inline-flex size-2 items-center justify-center"
        >
          <span className="size-2 rounded-full bg-primary" />
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
        </span>
        <span className="font-mono text-xs text-foreground/70 numeric-tnum">
          {diaCapital}
          <span className="mx-2 text-border">/</span>
          {fecha}
        </span>
      </div>
      {resumen && (
        <span className="font-mono text-xs text-foreground/80">{resumen}</span>
      )}
    </div>
  );
}
