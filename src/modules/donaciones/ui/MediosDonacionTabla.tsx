"use client";

import { Coins, Landmark } from "lucide-react";
import type { MedioDonacion } from "@/modules/donaciones/domain/MedioDonacion";
import { Button } from "@/shared/ui/button";
import { PanelBadge, PanelList, PanelListRow } from "@/shared/ui/panel";
import { TipoMedioBadge } from "./TipoMedioBadge";

type Props = {
  medios: MedioDonacion[];
  activarAction: (formData: FormData) => Promise<void>;
  desactivarAction: (formData: FormData) => Promise<void>;
  onEditar: (medio: MedioDonacion) => void;
};

// Medios de donación como row-cards (feature 026, guía
// `constitution/ui-guidelines.md §5`). Conserva datos (tipo, titular, datos,
// moneda, estado) y acciones (Editar / Ocultar-Mostrar).
export function MediosDonacionTabla({
  medios,
  activarAction,
  desactivarAction,
  onEditar,
}: Props) {
  if (medios.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay medios de donación. Añade uno para que el público sepa cómo
        donar.
      </p>
    );
  }

  return (
    <PanelList>
      {medios.map((medio) => (
        <PanelListRow
          key={medio.id}
          icon={Landmark}
          title={medio.titular}
          badge={
            <>
              <TipoMedioBadge tipo={medio.tipo} />
              <PanelBadge tone={medio.activo ? "active" : "neutral"}>
                {medio.activo ? "Activo" : "Oculto"}
              </PanelBadge>
            </>
          }
          secondary={medio.nota || undefined}
          meta={[
            { icon: Landmark, texto: medio.datos, label: "Datos" },
            {
              icon: Coins,
              texto: <span className="numeric-tnum font-mono">{medio.moneda}</span>,
              label: "Moneda",
            },
          ]}
          actions={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditar(medio)}
              >
                Editar
              </Button>
              <form action={medio.activo ? desactivarAction : activarAction}>
                <input type="hidden" name="id" value={medio.id} />
                <Button type="submit" variant="outline" size="sm">
                  {medio.activo ? "Ocultar" : "Mostrar"}
                </Button>
              </form>
            </>
          }
        />
      ))}
    </PanelList>
  );
}
