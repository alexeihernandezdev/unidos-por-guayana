import { MisTestimoniosGestion } from "@/modules/testimonios/ui";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";
import { listarMisSolicitudesServicio } from "@/shared/solicitudes";
import { listarTestimoniosDeAutorServicio } from "@/shared/testimonios";
import { PanelPage } from "@/shared/ui/panel";
import {
  crearTestimonioAction,
  editarTestimonioAction,
  eliminarTestimonioAction,
  retirarTestimonioAction,
} from "./actions";

export default async function MisTestimoniosPage() {
  const actor = await requireRol(Rol.COLABORADOR, Rol.SOLICITANTE);
  const [testimonios, solicitudes] = await Promise.all([
    listarTestimoniosDeAutorServicio(actor.id),
    actor.rol === Rol.SOLICITANTE
      ? listarMisSolicitudesServicio(actor.id)
      : Promise.resolve([]),
  ]);

  return (
    <PanelPage>
      <MisTestimoniosGestion
        testimonios={testimonios}
        solicitudes={solicitudes.map(({ id, sector }) => ({ id, sector }))}
        crearAction={crearTestimonioAction}
        editarAction={editarTestimonioAction}
        retirarAction={retirarTestimonioAction}
        eliminarAction={eliminarTestimonioAction}
      />
    </PanelPage>
  );
}
