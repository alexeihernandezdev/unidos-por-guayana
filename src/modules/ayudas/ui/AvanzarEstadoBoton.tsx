import type { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import { EstadoAyuda as Estados } from "@/modules/ayudas/domain/EstadoAyuda";
import { siguienteEstado } from "@/modules/ayudas/domain/maquinaEstados";
import { Button } from "@/shared/ui/button";
import { ESTADO_LABEL } from "./estados";

type Props = {
  ayudaId: string;
  estado: EstadoAyuda;
  // Server action (FormData) que avanza el estado al siguiente de la secuencia.
  // Lee `id`, y opcionalmente `nota` y `evidenciaUrl` (feature 010).
  avanzarAction: (formData: FormData) => Promise<void>;
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

// Botón que avanza el envío al siguiente estado de la máquina de estados. Si ya está
// en el estado terminal (`ENTREGADO`), no ofrece acción. Al avanzar, el ADMIN puede
// adjuntar una nota y una evidencia (URL a una foto); al pasar a ENTREGADO se le
// solicita especialmente, sin bloquear si faltan (feature 010).
export function AvanzarEstadoBoton({ ayudaId, estado, avanzarAction }: Props) {
  const siguiente = siguienteEstado(estado);

  if (!siguiente) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta actividad ya fue entregada. No hay más pasos.
      </p>
    );
  }

  const esEntrega = siguiente === Estados.ENTREGADO;

  return (
    <form action={avanzarAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={ayudaId} />

      <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-4">
        <p className="text-sm font-medium">
          Detalle del paso a {ESTADO_LABEL[siguiente]}{" "}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </p>
        {esEntrega ? (
          <p className="text-sm text-muted-foreground">
            Es el momento clave para la transparencia: añade una nota y una
            evidencia (enlace a una foto) que respalden la entrega.
          </p>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="nota" className="text-sm font-medium">
            Nota
          </label>
          <textarea
            id="nota"
            name="nota"
            rows={2}
            className={campo}
            placeholder="Salió del acopio de San Félix"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="evidenciaUrl" className="text-sm font-medium">
            Evidencia (enlace a una foto)
          </label>
          <input
            id="evidenciaUrl"
            name="evidenciaUrl"
            type="url"
            inputMode="url"
            className={campo}
            placeholder="https://…"
          />
        </div>
      </div>

      <Button type="submit" className="w-fit">
        Marcar como {ESTADO_LABEL[siguiente]}
      </Button>
    </form>
  );
}
