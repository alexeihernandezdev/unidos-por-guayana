"use client";

import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { Recurso } from "@/modules/recursos/domain/Recurso";
import {
  RecursoForm,
  type RecursoFormValores,
} from "@/modules/recursos/ui/RecursoForm";
import { RecursosTabla } from "@/modules/recursos/ui/RecursosTabla";
import { Button } from "@/shared/ui/button";
import { PanelFormModal, PanelPageHeader } from "@/shared/ui/panel";

type Resultado = { ok: boolean; error?: string };

type Props = {
  recursos: Recurso[];
  filtros: ReactNode;
  crearAction: (input: RecursoFormValores) => Promise<Resultado>;
  editarAction: (
    id: string,
    input: RecursoFormValores,
  ) => Promise<Resultado>;
  archivarAction: (formData: FormData) => Promise<void>;
  activarAction: (formData: FormData) => Promise<void>;
};

type ModalAbierto =
  | { modo: "nuevo" }
  | { modo: "editar"; recurso: Recurso }
  | null;

export function RecursosGestion({
  recursos,
  filtros,
  crearAction,
  editarAction,
  archivarAction,
  activarAction,
}: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalAbierto>(null);

  function cerrarYRefrescar() {
    setModal(null);
    router.refresh();
  }

  return (
    <>
      <PanelPageHeader
        icon={Package}
        eyebrow="Catálogo"
        title="Catálogo de recursos"
        description="Lista maestra de lo que se puede aportar o necesitar."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/panel/recursos/propuestas">Ver propuestas</Link>
            </Button>
            <Button onClick={() => setModal({ modo: "nuevo" })}>
              <Plus strokeWidth={1.5} aria-hidden="true" />
              Nuevo recurso
            </Button>
          </>
        }
      />

      {filtros}

      <RecursosTabla
        recursos={recursos}
        archivarAction={archivarAction}
        activarAction={activarAction}
        onEditar={(recurso) => setModal({ modo: "editar", recurso })}
      />

      <PanelFormModal
        open={modal !== null}
        onOpenChange={(abierto) => !abierto && setModal(null)}
        title={
          modal?.modo === "nuevo"
            ? "Nuevo recurso"
            : modal?.modo === "editar"
              ? "Editar recurso"
              : ""
        }
        description={
          modal?.modo === "nuevo"
            ? "Añade un recurso al catálogo."
            : modal?.modo === "editar"
              ? `Actualiza los datos de ${modal.recurso.nombre}.`
              : undefined
        }
      >
        {modal?.modo === "nuevo" && (
          <RecursoForm
            action={crearAction}
            onExito={cerrarYRefrescar}
            textoEnviar="Crear recurso"
            textoEnviando="Creando…"
          />
        )}
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
