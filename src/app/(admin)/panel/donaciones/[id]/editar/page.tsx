import { notFound } from "next/navigation";
import type { MedioDonacionFormValores } from "@/modules/donaciones/ui/MedioDonacionForm";
import { MedioDonacionForm } from "@/modules/donaciones/ui/MedioDonacionForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";
import { buscarMedioDonacionServicio } from "@/shared/donaciones";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";
import { editarMedioDonacionAction } from "@/app/(admin)/panel/donaciones/actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarMedioDonacionPage({ params }: Props) {
  await requireRol(Rol.ADMIN);

  const { id } = await params;
  const medio = await buscarMedioDonacionServicio(id);
  if (!medio) notFound();

  // Server action ligada al id de este medio; delega en el action validado.
  async function action(input: MedioDonacionFormValores) {
    "use server";
    return editarMedioDonacionAction(id, input);
  }

  return (
    <PanelPage>
      <PanelPageSubHeader
        title="Editar medio de donación"
        description={`Actualiza los datos de ${medio.titular}.`}
        backHref="/panel/donaciones"
        backLabel="Volver a donaciones"
      />

      <MedioDonacionForm
        action={action}
        valoresIniciales={{
          tipo: medio.tipo,
          titular: medio.titular,
          moneda: medio.moneda,
          datos: medio.datos,
          nota: medio.nota ?? "",
          orden: medio.orden,
        }}
        textoEnviar="Guardar cambios"
        textoEnviando="Guardando…"
      />
    </PanelPage>
  );
}
