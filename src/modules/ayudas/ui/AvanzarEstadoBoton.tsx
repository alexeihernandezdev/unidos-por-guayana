import type { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import { siguienteEstado } from "@/modules/ayudas/domain/maquinaEstados";
import { Button } from "@/shared/ui/button";
import { ESTADO_LABEL } from "./estados";

type Props = {
  ayudaId: string;
  estado: EstadoAyuda;
  // Server action (FormData) que avanza el estado al siguiente de la secuencia.
  avanzarAction: (formData: FormData) => Promise<void>;
};

// Botón que avanza el envío al siguiente estado de la máquina de estados. Si ya está
// en el estado terminal (`ENTREGADO`), no ofrece acción.
export function AvanzarEstadoBoton({ ayudaId, estado, avanzarAction }: Props) {
  const siguiente = siguienteEstado(estado);

  if (!siguiente) {
    return (
      <p className="text-sm text-muted-foreground">
        Este envío ya fue entregado. No hay más pasos.
      </p>
    );
  }

  return (
    <form action={avanzarAction}>
      <input type="hidden" name="id" value={ayudaId} />
      <Button type="submit">Marcar como {ESTADO_LABEL[siguiente]}</Button>
    </form>
  );
}
