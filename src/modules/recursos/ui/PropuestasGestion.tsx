"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Recurso } from "@/modules/recursos/domain/Recurso";
import {
  RecursoForm,
  type RecursoFormValores,
} from "@/modules/recursos/ui/RecursoForm";
import { PropuestasTabla } from "@/modules/recursos/ui/PropuestasTabla";
import { PanelFormModal } from "@/shared/ui/panel";

type Resultado = { ok: boolean; error?: string };

type Props = {
  propuestas: Recurso[];
  editarAction: (
    id: string,
    input: RecursoFormValores,
  ) => Promise<Resultado>;
  aprobarAction: (formData: FormData) => Promise<void>;
  rechazarAction: (formData: FormData) => Promise<void>;
};

type ModalAbierto = { modo: "editar"; recurso: Recurso } | null;

export function PropuestasGestion({
  propuestas,
  editarAction,
  aprobarAction,
  rechazarAction,
}: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalAbierto>(null);

  function cerrarYRefrescar() {
    setModal(null);
    router.refresh();
  }

  return (
    <>
      <PropuestasTabla
        propuestas={propuestas}
        aprobarAction={aprobarAction}
        rechazarAction={rechazarAction}
        onAjustar={(recurso) => setModal({ modo: "editar", recurso })}
      />

      <PanelFormModal
        open={modal !== null}
        onOpenChange={(abierto) => !abierto && setModal(null)}
        title="Ajustar propuesta"
        description={
          modal?.modo === "editar"
            ? `Revisa los datos de ${modal.recurso.nombre} antes de aprobar.`
            : undefined
        }
      >
        {modal?.modo === "editar" && (
          <RecursoForm
            action={(input) => editarAction(modal.recurso.id, input)}
            onExito={cerrarYRefrescar}
            valoresIniciales={{
              nombre: modal.recurso.nombre,
              unidad: modal.recurso.unidad,
              categoria: modal.recurso.categoria,
              descripcion: modal.recurso.descripcion ?? "",
            }}
            textoEnviar="Guardar cambios"
            textoEnviando="Guardando…"
          />
        )}
      </PanelFormModal>
    </>
  );
}
