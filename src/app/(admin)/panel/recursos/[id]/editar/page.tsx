import Link from "next/link";
import { notFound } from "next/navigation";
import type { RecursoFormValores } from "@/modules/recursos/ui/RecursoForm";
import { RecursoForm } from "@/modules/recursos/ui/RecursoForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { buscarRecursoServicio } from "@/shared/recursos";
import { requireRol } from "@/shared/auth";
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
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Editar recurso</h1>
        <p className="text-sm text-muted-foreground">
          Actualiza los datos de <span className="font-medium">{recurso.nombre}</span>.
        </p>
      </div>

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

      <Link
        href="/panel/recursos"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver al catálogo
      </Link>
    </main>
  );
}
