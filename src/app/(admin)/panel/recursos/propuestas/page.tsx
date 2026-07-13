import { PropuestasTabla } from "@/modules/recursos/ui/PropuestasTabla";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarPropuestasServicio } from "@/shared/recursos";
import { requireRol } from "@/shared/auth";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";
import {
  aprobarPropuestaAction,
  rechazarPropuestaAction,
} from "../actions";

export default async function PropuestasRecursosPage() {
  await requireRol(Rol.ADMIN);

  const propuestas = await listarPropuestasServicio();

  return (
    <PanelPage>
      <PanelPageSubHeader
        title="Propuestas de recursos"
        description="Recursos propuestos por solicitantes. Aprueba para incorporarlos al catálogo o rechaza para descartarlos."
        backHref="/panel/recursos"
        backLabel="Volver al catálogo"
      />

      <PropuestasTabla
        propuestas={propuestas}
        aprobarAction={aprobarPropuestaAction}
        rechazarAction={rechazarPropuestaAction}
      />
    </PanelPage>
  );
}
