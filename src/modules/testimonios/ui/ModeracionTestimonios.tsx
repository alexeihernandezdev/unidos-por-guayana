"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, MessageSquareQuote, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PanelEmptyState, PanelFormModal, PanelPageHeader } from "@/shared/ui/panel";
import { Textarea } from "@/shared/ui/textarea";
import { EstadoTestimonio, type Testimonio } from "../domain";
import { TestimonioCard } from "./TestimonioCard";

type Resultado = { ok: boolean; error?: string };

type Props = {
  testimonios: Testimonio[];
  filtros: React.ReactNode;
  aprobarAction: (id: string) => Promise<Resultado>;
  rechazarAction: (id: string, motivo: string) => Promise<Resultado>;
  ocultarAction: (id: string) => Promise<Resultado>;
  destacarAction: (id: string) => Promise<Resultado>;
  quitarDestacadoAction: (id: string) => Promise<Resultado>;
};

export function ModeracionTestimonios(props: Props) {
  const router = useRouter();
  const [rechazando, setRechazando] = useState<Testimonio | null>(null);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  function ejecutar(action: () => Promise<Resultado>, alExito?: () => void) {
    setError(null);
    startTransition(async () => {
      const resultado = await action();
      if (resultado.ok) {
        alExito?.();
        router.refresh();
      } else {
        setError(resultado.error ?? "No se pudo completar la acción.");
      }
    });
  }

  return (
    <>
      <PanelPageHeader
        icon={ShieldCheck}
        eyebrow="Confianza"
        title="Moderación de testimonios"
        description="Revisa las historias de la comunidad antes de publicarlas o destacarlas."
      />

      {props.filtros}

      {error ? (
        <p className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {props.testimonios.length === 0 ? (
        <PanelEmptyState
          bordered={false}
          icon={MessageSquareQuote}
          title="Sin testimonios para revisar"
          description="No hay resultados con los filtros seleccionados."
        />
      ) : (
        <section aria-label="Testimonios para moderar" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {props.testimonios.map((testimonio) => (
            <TestimonioCard key={testimonio.id} testimonio={testimonio} mostrarEstado>
              <div className="flex flex-wrap gap-2">
                {testimonio.estado === EstadoTestimonio.PENDIENTE ? (
                  <>
                    <Button
                      size="sm"
                      disabled={pendiente}
                      onClick={() => ejecutar(() => props.aprobarAction(testimonio.id))}
                    >
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pendiente}
                      onClick={() => {
                        setError(null);
                        setMotivo("");
                        setRechazando(testimonio);
                      }}
                    >
                      Rechazar
                    </Button>
                  </>
                ) : null}

                {testimonio.estado === EstadoTestimonio.APROBADO ? (
                  <>
                    <Button
                      size="sm"
                      variant={testimonio.destacado ? "outline" : "default"}
                      disabled={pendiente}
                      onClick={() =>
                        ejecutar(() =>
                          testimonio.destacado
                            ? props.quitarDestacadoAction(testimonio.id)
                            : props.destacarAction(testimonio.id),
                        )
                      }
                    >
                      <Star strokeWidth={1.5} aria-hidden />
                      {testimonio.destacado ? "Quitar destacado" : "Destacar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pendiente}
                      onClick={() => ejecutar(() => props.ocultarAction(testimonio.id))}
                    >
                      <EyeOff strokeWidth={1.5} aria-hidden />
                      Ocultar
                    </Button>
                  </>
                ) : null}
              </div>
            </TestimonioCard>
          ))}
        </section>
      )}

      <PanelFormModal
        open={rechazando !== null}
        onOpenChange={(open) => !open && setRechazando(null)}
        title="Solicitar cambios"
        description={rechazando ? `Explica a ${rechazando.autor.nombre} qué debe ajustar.` : undefined}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="motivo-rechazo" className="text-sm font-medium">
              Motivo del rechazo
            </label>
            <Textarea
              id="motivo-rechazo"
              rows={5}
              minLength={10}
              maxLength={300}
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              placeholder="Indica de forma concreta cómo puede mejorar el testimonio."
            />
            <p className="text-xs text-muted-foreground">Entre 10 y 300 caracteres.</p>
          </div>
          <Button
            disabled={pendiente || motivo.trim().length < 10}
            onClick={() => {
              if (!rechazando) return;
              ejecutar(
                () => props.rechazarAction(rechazando.id, motivo),
                () => setRechazando(null),
              );
            }}
          >
            {pendiente ? "Enviando…" : "Rechazar y notificar"}
          </Button>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </PanelFormModal>
    </>
  );
}
