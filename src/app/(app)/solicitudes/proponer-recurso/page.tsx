import { ProponerRecursoForm } from "@/modules/recursos/ui/ProponerRecursoForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";
import { proponerRecursoAction } from "../actions";

export default async function ProponerRecursoPage() {
  await requireRol(Rol.SOLICITANTE);

  return (
    <PanelPage>
      <PanelPageSubHeader
        title="Proponer un recurso al catálogo"
        description="Si el recurso que necesitas todavía no está listado, propónlo aquí. El equipo lo revisará antes de incorporarlo."
        backHref="/solicitudes/nueva"
        backLabel="Volver a la solicitud"
      />

      <ProponerRecursoForm
        action={proponerRecursoAction}
        rutaExito="/solicitudes/nueva"
      />
    </PanelPage>
  );
}
