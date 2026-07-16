import { EyeOff, Hash, Package, StickyNote, UserRound } from "lucide-react";
import type { Aporte } from "@/modules/aportes/domain/Aporte";
import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import { Button } from "@/shared/ui/button";
import { PanelList, PanelListRow } from "@/shared/ui/panel";
import { EstadoAporteBadge } from "./EstadoAporteBadge";

type Props = {
  aportes: Aporte[];
  // Server actions inyectadas desde la página (server component) para no acoplar
  // el componente a rutas concretas.
  marcarRecibidoAction: (formData: FormData) => Promise<void>;
  revertirRecibidoAction: (formData: FormData) => Promise<void>;
  cancelarAporteAction: (formData: FormData) => Promise<void>;
};

function formatearNumero(n: number): string {
  return new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(n);
}

// Aportes de una actividad como row-cards (feature 026, guía
// `constitution/ui-guidelines.md §5`). Conserva datos (colaborador, recurso,
// cantidad, nota, estado) y acciones (Marcar recibido / Cancelar / Revertir).
export function AportesTabla({
  aportes,
  marcarRecibidoAction,
  revertirRecibidoAction,
  cancelarAporteAction,
}: Props) {
  if (aportes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay aportes para esta actividad.
      </p>
    );
  }

  return (
    <PanelList>
      {aportes.map((a) => (
        <PanelListRow
          key={a.id}
          icon={UserRound}
          title={a.colaborador?.nombre ?? "Donación directa"}
          badge={<EstadoAporteBadge estado={a.estado} />}
          secondary={a.colaborador?.email || undefined}
          meta={[
            {
              icon: Package,
              texto: a.recurso?.nombre ?? "(recurso)",
              label: "Recurso",
            },
            {
              icon: Hash,
              label: "Cantidad",
              texto: (
                <span className="numeric-tnum font-mono">
                  {formatearNumero(a.cantidad)} {a.recurso?.unidad ?? ""}
                </span>
              ),
            },
            // El anonimato solo afecta a las superficies compartidas; aquí (panel
            // del dueño) se ve el nombre real, con un aviso de que es anónimo fuera.
            ...(a.esAnonimo
              ? [
                  {
                    icon: EyeOff,
                    texto: "Anónimo en público",
                    label: "Visibilidad",
                  },
                ]
              : []),
            ...(a.nota
              ? [{ icon: StickyNote, texto: a.nota, label: "Nota" }]
              : []),
          ]}
          actions={
            <>
              {a.estado === EstadoAporte.COMPROMETIDO && (
                <>
                  <form action={marcarRecibidoAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <input
                      type="hidden"
                      name="actividadId"
                      value={a.actividadId ?? ""}
                    />
                    <Button type="submit" size="sm">
                      Marcar recibido
                    </Button>
                  </form>
                  <form action={cancelarAporteAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <input
                      type="hidden"
                      name="actividadId"
                      value={a.actividadId ?? ""}
                    />
                    <Button type="submit" variant="ghost" size="sm">
                      Cancelar
                    </Button>
                  </form>
                </>
              )}
              {a.estado === EstadoAporte.RECIBIDO && (
                <form action={revertirRecibidoAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <input
                    type="hidden"
                    name="actividadId"
                    value={a.actividadId ?? ""}
                  />
                  <Button type="submit" variant="outline" size="sm">
                    Revertir
                  </Button>
                </form>
              )}
            </>
          }
        />
      ))}
    </PanelList>
  );
}
