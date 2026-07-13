import { MedioDonacionForm } from "@/modules/donaciones/ui/MedioDonacionForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";
import { crearMedioDonacionAction } from "../actions";

export default async function NuevoMedioDonacionPage() {
  await requireRol(Rol.ADMIN);

  return (
    <PanelPage>
      <PanelPageSubHeader
        title="Nuevo medio de donación"
        description="Añade un canal externo por el que el público pueda donar dinero."
        backHref="/panel/donaciones"
        backLabel="Volver a donaciones"
      />

      <MedioDonacionForm
        action={crearMedioDonacionAction}
        textoEnviar="Crear medio"
        textoEnviando="Creando…"
      />
    </PanelPage>
  );
}
