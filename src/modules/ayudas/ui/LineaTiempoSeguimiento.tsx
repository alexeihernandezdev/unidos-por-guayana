import type {
  SeguimientoEvento,
  SeguimientoEventoPublico,
} from "@/modules/ayudas/domain/SeguimientoEvento";
import { EventoSeguimiento } from "./EventoSeguimiento";

type EventoVista = SeguimientoEventoPublico &
  Partial<Pick<SeguimientoEvento, "registradoPor">>;

type Props = {
  eventos: EventoVista[];
  // Mapa opcional `idAdmin -> nombre` para mostrar quién registró cada evento
  // (solo en la vista del ADMIN; la traza pública no lo pasa, feature 009).
  registradores?: Record<string, string>;
};

// Línea de tiempo del envío (feature 010): el historial ordenado cronológicamente.
// Sirve tanto a la vista admin (con registrador) como a la pública (sin él): la
// diferencia es solo qué eventos y qué `registradores` recibe.
export function LineaTiempoSeguimiento({ eventos, registradores }: Props) {
  if (eventos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay eventos de seguimiento para esta actividad.
      </p>
    );
  }

  return (
    <ol className="flex flex-col">
      {eventos.map((evento) => (
        <EventoSeguimiento
          key={evento.id}
          evento={evento}
          registradorNombre={
            evento.registradoPor
              ? registradores?.[evento.registradoPor] ?? null
              : null
          }
        />
      ))}
    </ol>
  );
}
