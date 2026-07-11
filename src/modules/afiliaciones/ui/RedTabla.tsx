import { DateTime } from "luxon";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import type { MiembroRed } from "@/modules/afiliaciones/domain/Afiliacion";
import { Button } from "@/shared/ui/button";
import { CATEGORIA_LABEL_CORTA } from "./categorias";

type Props = {
  miembros: MiembroRed[];
  // Server action (FormData con `colaboradorId`) que remueve de la red.
  removerAction: (formData: FormData) => Promise<void>;
};

const VERIFICACION_LABEL: Record<string, string> = {
  VERIFICADO: "Verificado",
  PENDIENTE: "Pendiente",
  RECHAZADO: "Rechazado",
};

function fecha(valor: Date): string {
  return DateTime.fromJSDate(valor, { zone: "utc" })
    .setLocale("es-VE")
    .toFormat("dd/MM/yyyy");
}

// Listado de la red del ADMIN (feature 025): un colaborador afiliado por fila, con
// sus categorías, verificación, contacto y acción de remover.
export function RedTabla({ miembros, removerAction }: Props) {
  if (miembros.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay colaboradores afiliados a tu centro con este filtro.
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {miembros.map((m) => (
        <li
          key={m.colaboradorId}
          className="flex flex-wrap items-start justify-between gap-3 border-t border-border py-4"
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{m.nombre}</span>
              <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-foreground/80">
                {VERIFICACION_LABEL[m.estadoVerificacion] ?? m.estadoVerificacion}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {m.categorias.map((c) => (
                <span
                  key={c}
                  className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs text-primary-ink"
                >
                  {CATEGORIA_LABEL_CORTA[c as CategoriaRecurso] ?? c}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {m.telefono ? (
                <>
                  {m.telefono}
                  {m.telefonoEsWhatsApp ? " (WhatsApp)" : ""}
                </>
              ) : (
                "Sin teléfono"
              )}
              {" · afiliado el "}
              {fecha(m.afiliadoEn)}
            </p>
          </div>

          <form action={removerAction}>
            <input type="hidden" name="colaboradorId" value={m.colaboradorId} />
            <Button type="submit" variant="outline" size="sm">
              Remover de mi red
            </Button>
          </form>
        </li>
      ))}
    </ul>
  );
}
