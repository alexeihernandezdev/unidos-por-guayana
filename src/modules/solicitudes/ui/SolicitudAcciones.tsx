"use client";

import { useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import type { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import { esEditable, puedeCerrar, puedeMarcarAtendida } from "@/modules/solicitudes/domain/maquinaEstados";
import { Button } from "@/shared/ui/button";

type Props = {
  solicitudId: string;
  estado: EstadoSolicitud;
  modo: "solicitante" | "admin";
  cancelarAction?: (id: string) => Promise<{ ok: boolean; error?: string }>;
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
  modo,
  cancelarAction,
  marcarAtendidaAction,
  cerrarAction,
}: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();

  if (modo === "solicitante") {
    if (!esEditable(estado) || !cancelarAction) return null;

    return (
      <div className="flex flex-wrap gap-2">
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
      </div>
    );
  }

  if (!puedeMarcarAtendida(estado) && !puedeCerrar(estado)) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {puedeMarcarAtendida(estado) && marcarAtendidaAction && (
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
    </div>
  );
}
