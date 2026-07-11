import type { TipoMedioDonacion } from "@/modules/donaciones/domain/TipoMedioDonacion";
import { TIPO_MEDIO_LABEL } from "./tipos";

// Badge sobrio con el tipo de medio de donación. Estilo neutro (no compite con los
// badges de estado); solo distingue el canal de un vistazo.
export function TipoMedioBadge({ tipo }: { tipo: TipoMedioDonacion }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {TIPO_MEDIO_LABEL[tipo]}
    </span>
  );
}
