"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareQuote, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PanelEmptyState, PanelFormModal, PanelPageHeader } from "@/shared/ui/panel";
import { EstadoTestimonio, type Testimonio } from "../domain";
import { TestimonioCard } from "./TestimonioCard";
import { TestimonioForm, type TestimonioFormValores } from "./TestimonioForm";

type Resultado = { ok: boolean; error?: string };

type Props = {
  testimonios: Testimonio[];
  solicitudes: { id: string; sector: string }[];
  crearAction: (input: TestimonioFormValores) => Promise<Resultado>;
  editarAction: (id: string, input: TestimonioFormValores) => Promise<Resultado>;
  retirarAction: (id: string) => Promise<Resultado>;
  eliminarAction: (id: string) => Promise<Resultado>;
};

type Modal = { modo: "nuevo" } | { modo: "editar"; testimonio: Testimonio } | null;

export function MisTestimoniosGestion(props: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const resumen = [
    {
      label: "Pendientes",
      valor: props.testimonios.filter(
        (testimonio) => testimonio.estado === EstadoTestimonio.PENDIENTE,
      ).length,
    },
    {
      label: "Publicados",
      valor: props.testimonios.filter(
        (testimonio) => testimonio.estado === EstadoTestimonio.APROBADO,
      ).length,
    },
    {
      label: "Por ajustar",
      valor: props.testimonios.filter(
        (testimonio) => testimonio.estado === EstadoTestimonio.RECHAZADO,
      ).length,
    },
  ];

  function cerrarYRefrescar() {
    setModal(null);
    router.refresh();
  }

  function ejecutar(action: () => Promise<Resultado>) {
    setError(null);
    startTransition(async () => {
      const resultado = await action();
      if (resultado.ok) router.refresh();
      else setError(resultado.error ?? "No se pudo completar la acción.");
    });
  }

  return (
    <>
      <PanelPageHeader
        animated
        icon={MessageSquareQuote}
        eyebrow="Tu voz"
        title="Mis testimonios"
        description="Comparte tu experiencia con la red. Cada historia se revisa antes de publicarse."
        actions={
          <Button onClick={() => setModal({ modo: "nuevo" })} className="min-h-11">
            <Plus strokeWidth={1.5} aria-hidden />
            Compartir testimonio
          </Button>
        }
      />

      <section aria-label="Resumen de testimonios" className="grid grid-cols-3 overflow-hidden rounded-xl border border-border bg-card">
        {resumen.map((item) => (
          <div
            key={item.label}
            className="border-border px-4 py-4 text-center [&:not(:last-child)]:border-r sm:px-6 sm:text-left"
          >
            <p className="font-mono text-2xl font-semibold text-primary-ink numeric-tnum">
              {item.valor}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </section>

      {error ? (
        <p className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {props.testimonios.length === 0 ? (
        <PanelEmptyState
          bordered={false}
          icon={MessageSquareQuote}
          title="Aún no has compartido tu historia"
          description="Tu experiencia puede dar confianza y orientar a otras personas de la comunidad."
          action={
            <Button variant="outline" onClick={() => setModal({ modo: "nuevo" })}>
              Compartir mi experiencia
            </Button>
          }
        />
      ) : (
        <section aria-label="Tus testimonios" className="panel-stagger grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {props.testimonios.map((testimonio) => {
            const editable =
              testimonio.estado === EstadoTestimonio.PENDIENTE ||
              testimonio.estado === EstadoTestimonio.RECHAZADO;
            return (
              <TestimonioCard key={testimonio.id} testimonio={testimonio} mostrarEstado>
                <div className="flex flex-wrap gap-2">
                  {editable ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pendiente}
                      onClick={() => setModal({ modo: "editar", testimonio })}
                    >
                      <Pencil strokeWidth={1.5} aria-hidden />
                      Editar
                    </Button>
                  ) : null}
                  {testimonio.estado !== EstadoTestimonio.OCULTO ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pendiente}
                      onClick={() => ejecutar(() => props.retirarAction(testimonio.id))}
                    >
                      Retirar
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={pendiente}
                    className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Eliminar ${testimonio.titulo}`}
                    onClick={() => {
                      if (window.confirm(`¿Eliminar “${testimonio.titulo}”?`)) {
                        ejecutar(() => props.eliminarAction(testimonio.id));
                      }
                    }}
                  >
                    <Trash2 strokeWidth={1.5} aria-hidden />
                  </Button>
                </div>
              </TestimonioCard>
            );
          })}
        </section>
      )}

      <PanelFormModal
        open={modal !== null}
        onOpenChange={(open) => !open && setModal(null)}
        title={modal?.modo === "editar" ? "Editar testimonio" : "Compartir testimonio"}
        description="Tu nombre, rol y ubicación se añadirán desde tu perfil."
        size="wide"
      >
        {modal ? (
          <TestimonioForm
            key={modal.modo === "editar" ? modal.testimonio.id : "nuevo"}
            solicitudes={props.solicitudes}
            valoresIniciales={
              modal.modo === "editar"
                ? {
                    titulo: modal.testimonio.titulo,
                    contenido: modal.testimonio.contenido,
                    solicitudId: modal.testimonio.solicitudId ?? "ninguna",
                  }
                : undefined
            }
            action={(input) =>
              modal.modo === "editar"
                ? props.editarAction(modal.testimonio.id, input)
                : props.crearAction(input)
            }
            onExito={cerrarYRefrescar}
          />
        ) : null}
      </PanelFormModal>
    </>
  );
}
