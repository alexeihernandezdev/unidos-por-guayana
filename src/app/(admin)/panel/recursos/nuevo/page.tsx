import { RecursoForm } from "@/modules/recursos/ui/RecursoForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";
import { crearRecursoAction } from "../actions";

export default async function NuevoRecursoPage() {
  await requireRol(Rol.ADMIN);

  return (
    <PanelPage>
      <PanelPageSubHeader
        title="Nuevo recurso"
        description="Añade un recurso al catálogo."
        backHref="/panel/recursos"
        backLabel="Volver al catálogo"
      />

      <RecursoForm
        action={crearRecursoAction}
        textoEnviar="Crear recurso"
        textoEnviando="Creando…"
      />
    </PanelPage>
  );
}
