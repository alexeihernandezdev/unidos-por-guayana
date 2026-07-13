import { BadgeCheck, Clock } from "lucide-react";
import type { MiembroRedApto } from "@/modules/afiliaciones/application/consultarRed";
import { CATEGORIA_LABEL_CORTA } from "./categorias";

type Props = {
  miembros: MiembroRedApto[];
};

/**
 * Lista de solo lectura de los colaboradores aptos de la red para una categoría
 * (feature 026), mostrada al desplegar "+ info" al crear/editar una Actividad.
 * Nombre, categorías declaradas y estado de verificación. Sin datos de contacto:
 * para contactar sigue estando `/panel/red`.
 */
export function RedAptaLista({ miembros }: Props) {
  if (miembros.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Nadie de tu red declaró poder aportar esto todavía.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
      {miembros.map((m) => (
        <li
          key={m.colaboradorId}
          className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2"
        >
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {m.nombre}
            </span>
            <span className="text-xs text-muted-foreground">
              {m.categorias.map((c) => CATEGORIA_LABEL_CORTA[c]).join(", ")}
            </span>
          </div>
          {m.verificado ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
              <BadgeCheck className="size-3.5" strokeWidth={1.5} aria-hidden />
              Verificado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Clock className="size-3.5" strokeWidth={1.5} aria-hidden />
              Pendiente
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
