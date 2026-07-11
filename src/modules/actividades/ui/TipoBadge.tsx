import type { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import { cn } from "@/shared/lib/utils";
import { TIPO_BADGE, etiquetaTipo } from "./tipos";

type Props = {
  tipo: TipoActividad;
  className?: string;
};

// Píldora que muestra el tipo de actividad (envío, jornada, evento social).
// Se mantiene visualmente separado del `EstadoBadge`: no se mezclan en uno solo.
export function TipoBadge({ tipo, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        TIPO_BADGE[tipo],
        className,
      )}
    >
      {etiquetaTipo(tipo)}
    </span>
  );
}
