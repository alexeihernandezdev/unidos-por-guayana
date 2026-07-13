import { notFound } from "next/navigation";
import type { RecursoFormValores } from "@/modules/recursos/ui/RecursoForm";
import { RecursoForm } from "@/modules/recursos/ui/RecursoForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { buscarRecursoServicio } from "@/shared/recursos";
import { requireRol } from "@/shared/auth";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";
import { editarRecursoAction } from "@/app/(admin)/panel/recursos/actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarRecursoPage({ params }: Props) {
  await requireRol(Rol.ADMIN);

  const { id } = await params;
  const recurso = await buscarRecursoServicio(id);
  if (!recurso) notFound();

  // Server action ligada al id de este recurso; delega en el action validado.
  async function action(input: RecursoFormValores) {
    "use server";
    return editarRecursoAction(id, input);
  }

  return (
    <PanelPage>
      <PanelPageSubHeader
        title="Editar recurso"
        description={`Actualiza los datos de ${recurso.nombre}.`}
        backHref="/panel/recursos"
        backLabel="Volver al catálogo"
      />

      <RecursoForm
        action={action}
        valoresIniciales={{
          nombre: recurso.nombre,
          unidad: recurso.unidad,
          categoria: recurso.categoria,
          descripcion: recurso.descripcion ?? "",
        }}
        textoEnviar="Guardar cambios"
        textoEnviando="Guardando…"
      />
    </PanelPage>
  );
}
