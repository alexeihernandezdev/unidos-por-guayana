import Link from "next/link";
import { notFound } from "next/navigation";
import type { MedioDonacionFormValores } from "@/modules/donaciones/ui/MedioDonacionForm";
import { MedioDonacionForm } from "@/modules/donaciones/ui/MedioDonacionForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";
import { buscarMedioDonacionServicio } from "@/shared/donaciones";
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
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar medio de donación
        </h1>
        <p className="text-sm text-muted-foreground">
          Actualiza los datos de{" "}
          <span className="font-medium">{medio.titular}</span>.
        </p>
      </div>

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

      <Link
        href="/panel/donaciones"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver a donaciones
      </Link>
    </main>
  );
}
