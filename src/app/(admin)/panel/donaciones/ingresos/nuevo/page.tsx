import { DateTime } from "luxon";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { RegistroIngresoForm } from "@/modules/donaciones/ui/RegistroIngresoForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";
import { listarActividadesServicio } from "@/shared/actividades";
import { listarMediosDonacionServicio } from "@/shared/donaciones";
import { listarRecursosServicio } from "@/shared/recursos";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";
import { registrarAporteExternoAction } from "@/app/(admin)/panel/donaciones/actions";

export default async function NuevoIngresoPage() {
  const admin = await requireRol(Rol.ADMIN);

  const [recursos, medios, ayudas] = await Promise.all([
    listarRecursosServicio({
      categoria: CategoriaRecurso.MONETARIO,
      soloSeleccionables: true,
    }),
    listarMediosDonacionServicio(),
    listarActividadesServicio({ adminId: admin.id, estado: EstadoActividad.RECOLECTANDO }),
  ]);

  const recursoIdsMonetarios = new Set(recursos.map((r) => r.id));
  // Solo actividades del admin en RECOLECTANDO que tengan una meta monetaria: son
  // las que un ingreso puede alimentar.
  const ayudasConMetaMonetaria = ayudas
    .filter((a) => a.metas.some((m) => recursoIdsMonetarios.has(m.recursoId)))
    .map((a) => ({ id: a.id, titulo: a.titulo }));

  const fechaHoy = DateTime.now().toFormat("yyyy-MM-dd");

  return (
    <PanelPage>
      <PanelPageSubHeader
        title="Registrar ingreso monetario"
        description="Deja constancia de un monto ya recibido por fuera de la aplicación. Esto no procesa ningún pago: solo registra dinero que ya entró."
        backHref="/panel/donaciones"
        backLabel="Volver a donaciones"
      />

      <RegistroIngresoForm
        action={registrarAporteExternoAction}
        recursos={recursos.map((r) => ({
          id: r.id,
          nombre: r.nombre,
          unidad: r.unidad,
        }))}
        medios={medios.map((m) => ({
          id: m.id,
          titular: m.titular,
          moneda: m.moneda,
        }))}
        ayudas={ayudasConMetaMonetaria}
        fechaHoy={fechaHoy}
      />
    </PanelPage>
  );
}
