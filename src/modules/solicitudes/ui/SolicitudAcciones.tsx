"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import type { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import {
  EstadoVerificacionSolicitud,
  type EstadoVerificacionSolicitud as EstadoVerificacion,
} from "@/modules/auditoria/domain/EstadoVerificacionSolicitud";
import { esEditable, puedeCerrar, puedeMarcarAtendida } from "@/modules/solicitudes/domain/maquinaEstados";
import { Button } from "@/shared/ui/button";

type Props = {
  solicitudId: string;
  estado: EstadoSolicitud;
  estadoVerificacion: EstadoVerificacion;
  modo: "solicitante" | "admin";
  cancelarAction?: (id: string) => Promise<{ ok: boolean; error?: string }>;
  reenviarAction?: (id: string) => Promise<{ ok: boolean; error?: string }>;
  marcarAtendidaAction?: (formData: FormData) => Promise<void>;
  cerrarAction?: (formData: FormData) => Promise<void>;
};

function BotonAccionAdmin({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "default" | "outline";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} disabled={pending} className="h-11">
      {pending ? (
        <LoaderCircle className="animate-spin" strokeWidth={1.5} aria-hidden />
      ) : null}
      {pending ? "Guardando" : children}
    </Button>
  );
}

export function SolicitudAcciones({
  solicitudId,
  estado,
  estadoVerificacion,
  modo,
  cancelarAction,
  reenviarAction,
  marcarAtendidaAction,
  cerrarAction,
}: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (modo === "solicitante") {
    if (!esEditable(estado) || !cancelarAction) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {estadoVerificacion ===
          EstadoVerificacionSolicitud.REQUIERE_INFORMACION &&
        reenviarAction ? (
          <Button
            type="button"
            disabled={pendiente}
            onClick={() => {
              setError("");
              startTransition(async () => {
                const resultado = await reenviarAction(solicitudId);
                if (resultado.ok) router.refresh();
                else setError(resultado.error ?? "No se pudo reenviar.");
              });
            }}
          >
            {pendiente ? "Reenviando" : "Reenviar a auditoría"}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          disabled={pendiente}
          onClick={() => {
            if (
              !confirm(
                "¿Cancelar esta solicitud? No podrás editarla después.",
              )
            ) {
              return;
            }
            startTransition(async () => {
              const resultado = await cancelarAction(solicitudId);
              if (resultado.ok) {
                router.refresh();
              }
            });
          }}
        >
          Cancelar solicitud
        </Button>
        {error ? (
          <p className="basis-full text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  if (!puedeMarcarAtendida(estado) && !puedeCerrar(estado)) return null;

  const verificada =
    estadoVerificacion === EstadoVerificacionSolicitud.VERIFICADA;

  return (
    <div className="flex flex-wrap gap-2">
      {puedeMarcarAtendida(estado) && marcarAtendidaAction && verificada && (
        <form action={marcarAtendidaAction}>
          <input type="hidden" name="id" value={solicitudId} />
          <BotonAccionAdmin variant="default">Marcar atendida</BotonAccionAdmin>
        </form>
      )}
      {puedeCerrar(estado) && cerrarAction && (
        <form action={cerrarAction}>
          <input type="hidden" name="id" value={solicitudId} />
          <BotonAccionAdmin variant="outline">Cerrar</BotonAccionAdmin>
        </form>
      )}
      {!verificada && puedeMarcarAtendida(estado) ? (
        <p className="basis-full text-sm text-warning-ink">
          La atención se habilitará cuando auditoría verifique la solicitud.
        </p>
      ) : null}
    </div>
  );
}
