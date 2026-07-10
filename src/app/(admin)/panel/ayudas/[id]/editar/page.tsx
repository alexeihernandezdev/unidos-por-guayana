import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AyudaNoEncontradaError } from "@/modules/ayudas/application/errors";
import type { Ayuda } from "@/modules/ayudas/domain/Ayuda";
import { esEditable } from "@/modules/ayudas/domain/maquinaEstados";
import type { AyudaFormValores } from "@/modules/ayudas/ui/AyudaForm";
import { AyudaForm } from "@/modules/ayudas/ui/AyudaForm";
import { fechaParaInput } from "@/modules/ayudas/ui/fechas";
import { MetasEditor } from "@/modules/ayudas/ui/MetasEditor";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { obtenerAyudaServicio } from "@/shared/ayudas";
import { listarRecursosServicio } from "@/shared/recursos";
import { requireRol } from "@/shared/auth";
import {
  editarCabeceraAction,
  guardarMetaAction,
  quitarMetaAction,
} from "@/app/(admin)/panel/ayudas/actions";

type Props = {
  params: Promise<{ id: string }>;
};

async function cargarAyuda(id: string): Promise<Ayuda> {
  try {
    return await obtenerAyudaServicio(id);
  } catch (error) {
    if (error instanceof AyudaNoEncontradaError) notFound();
    throw error;
  }
}

export default async function EditarAyudaPage({ params }: Props) {
  await requireRol(Rol.ADMIN);

  const { id } = await params;
  const ayuda = await cargarAyuda(id);

  // Solo se edita en RECOLECTANDO; si ya avanzó, se bloquea (vuelve al detalle).
  if (!esEditable(ayuda.estado)) {
    redirect(`/panel/ayudas/${id}`);
  }

  const recursos = (
    await listarRecursosServicio({ soloSeleccionables: true })
  ).map(
    (r) => ({ id: r.id, nombre: r.nombre, unidad: r.unidad }),
  );

  // Server action de cabecera ligada al id de esta ayuda; delega en el action validado.
  async function accionCabecera(input: AyudaFormValores) {
    "use server";
    return editarCabeceraAction(id, input);
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Editar actividad</h1>
        <p className="text-sm text-muted-foreground">
          Ajusta la cabecera y las metas mientras la actividad está en Recolectando.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Cabecera</h2>
        <AyudaForm
          action={accionCabecera}
          recursos={recursos}
          valoresIniciales={{
            titulo: ayuda.titulo,
            sectorDestino: ayuda.sectorDestino,
            fecha: fechaParaInput(ayuda.fecha),
            tipo: ayuda.tipo,
            descripcion: ayuda.descripcion ?? "",
          }}
          textoEnviar="Guardar cambios"
          textoEnviando="Guardando…"
        />
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Metas de recursos</h2>
        <MetasEditor
          ayudaId={ayuda.id}
          metas={ayuda.metas}
          recursos={recursos}
          guardarAction={guardarMetaAction}
          quitarAction={quitarMetaAction}
        />
      </section>

      <Link
        href={`/panel/ayudas/${ayuda.id}`}
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver al detalle
      </Link>
    </main>
  );
}
