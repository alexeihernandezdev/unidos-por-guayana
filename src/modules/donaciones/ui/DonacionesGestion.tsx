"use client";

import { HandCoins, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Aporte } from "@/modules/aportes/domain/Aporte";
import type { MedioDonacion } from "@/modules/donaciones/domain/MedioDonacion";
import {
  MedioDonacionForm,
  type MedioDonacionFormValores,
} from "@/modules/donaciones/ui/MedioDonacionForm";
import { MediosDonacionTabla } from "@/modules/donaciones/ui/MediosDonacionTabla";
import { IngresosMonetariosTabla } from "@/modules/donaciones/ui/IngresosMonetariosTabla";
import {
  RegistroIngresoForm,
  type OpcionAyuda,
  type OpcionMedio,
  type OpcionRecurso,
  type RegistroIngresoFormValores,
} from "@/modules/donaciones/ui/RegistroIngresoForm";
import { Button } from "@/shared/ui/button";
import { PanelFormModal, PanelPageHeader } from "@/shared/ui/panel";

type Resultado = { ok: boolean; error?: string };

type ModalAbierto =
  | { modo: "nuevo-medio" }
  | { modo: "editar-medio"; medio: MedioDonacion }
  | { modo: "nuevo-ingreso" }
  | null;

type Props = {
  medios: MedioDonacion[];
  ingresos: Aporte[];
  ingreso: {
    recursos: OpcionRecurso[];
    medios: OpcionMedio[];
    ayudas: OpcionAyuda[];
    fechaHoy: string;
  };
  crearMedioAction: (input: MedioDonacionFormValores) => Promise<Resultado>;
  editarMedioAction: (
    id: string,
    input: MedioDonacionFormValores,
  ) => Promise<Resultado>;
  registrarIngresoAction: (
    input: RegistroIngresoFormValores,
  ) => Promise<Resultado>;
  activarMedioAction: (formData: FormData) => Promise<void>;
  desactivarMedioAction: (formData: FormData) => Promise<void>;
};

export function DonacionesGestion({
  medios,
  ingresos,
  ingreso,
  crearMedioAction,
  editarMedioAction,
  registrarIngresoAction,
  activarMedioAction,
  desactivarMedioAction,
}: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalAbierto>(null);

  function cerrarYRefrescar() {
    setModal(null);
    router.refresh();
  }

  const tituloModal =
    modal?.modo === "nuevo-medio"
      ? "Nuevo medio de donación"
      : modal?.modo === "editar-medio"
        ? "Editar medio de donación"
        : modal?.modo === "nuevo-ingreso"
          ? "Registrar ingreso monetario"
          : "";

  const descripcionModal =
    modal?.modo === "nuevo-medio"
      ? "Añade un canal externo por el que el público pueda donar dinero."
      : modal?.modo === "editar-medio"
        ? `Actualiza los datos de ${modal.medio.titular}.`
        : modal?.modo === "nuevo-ingreso"
          ? "Deja constancia de un monto ya recibido por fuera de la aplicación."
          : undefined;

  return (
    <>
      <PanelPageHeader
        icon={HandCoins}
        eyebrow="Transparencia"
        title="Donaciones monetarias"
        description="Muestra al público cómo donar dinero y registra los montos ya recibidos por fuera. La aplicación no procesa ningún pago."
      />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Medios de donación
            </h2>
            <p className="text-sm text-muted-foreground">
              Canales externos por los que el público puede donar (cuenta, Pago
              Móvil, Zelle, PayPal…).
            </p>
          </div>
          <Button onClick={() => setModal({ modo: "nuevo-medio" })}>
            <Plus strokeWidth={1.5} aria-hidden="true" />
            Nuevo medio
          </Button>
        </div>
        <MediosDonacionTabla
          medios={medios}
          activarAction={activarMedioAction}
          desactivarAction={desactivarMedioAction}
          onEditar={(medio) => setModal({ modo: "editar-medio", medio })}
        />
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Ingresos monetarios registrados
            </h2>
            <p className="text-sm text-muted-foreground">
              Montos ya recibidos por fuera que suman a la transparencia.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setModal({ modo: "nuevo-ingreso" })}
          >
            Registrar ingreso
          </Button>
        </div>
        <IngresosMonetariosTabla ingresos={ingresos} />
      </section>

      <PanelFormModal
        open={modal !== null}
        onOpenChange={(abierto) => !abierto && setModal(null)}
        title={tituloModal}
        description={descripcionModal}
      >
        {modal?.modo === "nuevo-medio" && (
          <MedioDonacionForm
            action={crearMedioAction}
            onExito={cerrarYRefrescar}
            textoEnviar="Crear medio"
            textoEnviando="Creando…"
          />
        )}
        {modal?.modo === "editar-medio" && (
          <MedioDonacionForm
            action={(input) => editarMedioAction(modal.medio.id, input)}
            onExito={cerrarYRefrescar}
            valoresIniciales={{
              tipo: modal.medio.tipo,
              titular: modal.medio.titular,
              moneda: modal.medio.moneda,
              datos: modal.medio.datos,
              nota: modal.medio.nota ?? "",
              orden: modal.medio.orden,
            }}
            textoEnviar="Guardar cambios"
            textoEnviando="Guardando…"
          />
        )}
        {modal?.modo === "nuevo-ingreso" && (
          <RegistroIngresoForm
            action={registrarIngresoAction}
            onExito={cerrarYRefrescar}
            recursos={ingreso.recursos}
            medios={ingreso.medios}
            ayudas={ingreso.ayudas}
            fechaHoy={ingreso.fechaHoy}
          />
        )}
      </PanelFormModal>
    </>
  );
}
