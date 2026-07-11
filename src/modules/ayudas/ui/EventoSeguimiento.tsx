import type {
  SeguimientoEvento,
  SeguimientoEventoPublico,
} from "@/modules/ayudas/domain/SeguimientoEvento";
import { ESTADO_LABEL } from "./estados";
import { formatearFechaHora } from "./fechas";

// Acepta tanto el evento completo (admin) como el público: `registradoPor` es
// opcional y solo se muestra si viene (nunca en la traza pública, feature 009).
type EventoVista = SeguimientoEventoPublico & Partial<Pick<SeguimientoEvento, "registradoPor">>;

type Props = {
  evento: EventoVista;
  // Nombre legible de quien registró el evento (solo admin). Si no viene, no se
  // muestra ningún dato del registrador.
  registradorNombre?: string | null;
};

/** Título de un evento: "Actividad creada" o "Pasó a En tránsito". */
function tituloEvento(evento: EventoVista): string {
  if (evento.estadoAnterior === null) {
    return "Actividad creada";
  }
  return `Pasó a ${ESTADO_LABEL[evento.estadoNuevo]}`;
}

// Un hito de la línea de tiempo del envío (feature 010): fecha, transición, nota y
// evidencia. Presentacional y de solo lectura (un evento es un hecho inmutable).
export function EventoSeguimiento({ evento, registradorNombre }: Props) {
  return (
    <li className="relative flex flex-col gap-1 pb-6 pl-8 last:pb-0">
      {/* Línea vertical y punto del hito */}
      <span
        aria-hidden
        className="absolute left-[7px] top-2 h-full w-px bg-border last:hidden"
      />
      <span
        aria-hidden
        className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background"
      />

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-medium text-foreground">{tituloEvento(evento)}</p>
        <time className="numeric-tnum font-mono text-xs text-muted-foreground">
          {formatearFechaHora(evento.ocurridoEn)}
        </time>
      </div>

      {evento.nota ? (
        <p className="max-w-[65ch] text-sm text-foreground/80 [text-wrap:pretty]">
          {evento.nota}
        </p>
      ) : null}

      {evento.evidenciaUrl ? (
        <a
          href={evento.evidenciaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring w-fit text-sm text-primary underline-offset-4 hover:underline"
        >
          Ver evidencia
        </a>
      ) : null}

      {registradorNombre ? (
        <p className="text-xs text-muted-foreground">
          Registrado por {registradorNombre}
        </p>
      ) : null}
    </li>
  );
}
