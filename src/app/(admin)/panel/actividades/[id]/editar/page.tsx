import { notFound, redirect } from "next/navigation";
import {
  ActividadNoPerteneceAlAdminError,
  ActividadNoEncontradaError,
} from "@/modules/actividades/application/errors";
import type { Actividad } from "@/modules/actividades/domain/Actividad";
import { esEditable } from "@/modules/actividades/domain/maquinaEstados";
import type { ActividadFormValores } from "@/modules/actividades/ui/ActividadForm";
import { ActividadForm } from "@/modules/actividades/ui/ActividadForm";
import { fechaParaInput, horaParaInput } from "@/modules/actividades/ui/fechas";
import { MetasEditor } from "@/modules/actividades/ui/MetasEditor";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { obtenerActividadServicio } from "@/shared/actividades";
import { listarNecesidadesPendientesServicio } from "@/shared/atenciones";
import { listarPuntosDeAdminServicio } from "@/shared/acopio";
import { listarRecursosServicio } from "@/shared/recursos";
import { requireRol } from "@/shared/auth";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";
import {
  desvincularNecesidadAction,
  editarCabeceraAction,
  guardarMetaAction,
  quitarMetaAction,
  vincularNecesidadAction,
} from "@/app/(admin)/panel/actividades/actions";

type Props = {
  params: Promise<{ id: string }>;
};

async function cargarActividad(id: string, adminId: string): Promise<Actividad> {
  try {
    return await obtenerActividadServicio(id, adminId);
  } catch (error) {
    if (
      error instanceof ActividadNoEncontradaError ||
      error instanceof ActividadNoPerteneceAlAdminError
    ) {
      notFound();
    }
    throw error;
  }
}

export default async function EditarActividadPage({ params }: Props) {
  const sesion = await requireRol(Rol.ADMIN);

  const { id } = await params;
  const ayuda = await cargarActividad(id, sesion.id);

  // Solo se edita en RECOLECTANDO; si ya avanzó, se bloquea (vuelve al detalle).
  if (!esEditable(ayuda.estado)) {
    redirect(`/panel/actividades/${id}`);
  }

  const recursos = (
    await listarRecursosServicio({ soloSeleccionables: true })
  ).map((r) => ({
    id: r.id,
    nombre: r.nombre,
    unidad: r.unidad,
    categoria: r.categoria,
  }));
  const puntos = await listarPuntosDeAdminServicio(sesion.id, { activo: true });
  // Necesidades pendientes para el sidebar arrastrable (feature 030).
  const necesidades = await listarNecesidadesPendientesServicio();

  // Server action de cabecera ligada al id de esta ayuda; delega en el action validado.
  async function accionCabecera(input: ActividadFormValores) {
    "use server";
    return editarCabeceraAction(id, input);
  }

  return (
    <PanelPage>
      <PanelPageSubHeader
        title="Editar actividad"
        description="Ajusta la cabecera y las metas mientras la actividad está en Recolectando."
        backHref={`/panel/actividades/${ayuda.id}`}
        backLabel="Volver al detalle"
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Cabecera</h2>
        <ActividadForm
          action={accionCabecera}
          recursos={recursos}
          puntosAcopio={puntos.map((p) => ({ id: p.id, nombre: p.nombre }))}
          valoresIniciales={{
            titulo: ayuda.titulo,
            sectorDestino: ayuda.sectorDestino,
            fecha: fechaParaInput(ayuda.fecha),
            horaFin: ayuda.horaFin ? horaParaInput(ayuda.horaFin) : "",
            tipo: ayuda.tipo,
            descripcion: ayuda.descripcion ?? "",
            puntosAcopioIds: ayuda.puntosAcopio.map((p) => p.id),
          }}
          textoEnviar="Guardar cambios"
          textoEnviando="Guardando…"
        />
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Metas de recursos</h2>
        <MetasEditor
          actividadId={ayuda.id}
          metas={ayuda.metas}
          recursos={recursos}
          necesidades={necesidades}
          guardarAction={guardarMetaAction}
          quitarAction={quitarMetaAction}
          vincularAction={vincularNecesidadAction}
          desvincularAction={desvincularNecesidadAction}
        />
      </section>
    </PanelPage>
  );
}
