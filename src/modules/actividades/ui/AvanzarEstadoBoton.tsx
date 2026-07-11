import type { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import type { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import { siguienteEstado } from "@/modules/actividades/domain/maquinaEstados";
import { Button } from "@/shared/ui/button";
import { ESTADO_LABEL } from "./estados";

type Props = {
  actividadId: string;
  tipo: TipoActividad;
  estado: EstadoActividad;
  // Server action (FormData) que avanza el estado al siguiente de la secuencia.
  avanzarAction: (formData: FormData) => Promise<void>;
};

// Botón que avanza la actividad al siguiente estado de la máquina de estados de su
// tipo (feature 024). Si ya está en el estado terminal, no ofrece acción.
export function AvanzarEstadoBoton({
  actividadId,
  tipo,
  estado,
  avanzarAction,
}: Props) {
  const siguiente = siguienteEstado(tipo, estado);

  if (!siguiente) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta actividad ya llegó a su estado final. No hay más pasos.
      </p>
    );
  }

  return (
    <form action={avanzarAction}>
      <input type="hidden" name="id" value={actividadId} />
      <Button type="submit">Marcar como {ESTADO_LABEL[siguiente]}</Button>
    </form>
  );
}
