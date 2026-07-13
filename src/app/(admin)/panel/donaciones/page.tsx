import { DateTime } from "luxon";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { DonacionesGestion } from "@/modules/donaciones/ui/DonacionesGestion";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarIngresosExternosServicio } from "@/shared/aportes";
import { requireRol } from "@/shared/auth";
import { listarActividadesServicio } from "@/shared/actividades";
import { listarMediosDonacionServicio } from "@/shared/donaciones";
import { listarRecursosServicio } from "@/shared/recursos";
import { PanelPage } from "@/shared/ui/panel";
import {
  activarMedioDonacionAction,
  crearMedioDonacionAction,
  desactivarMedioDonacionAction,
  editarMedioDonacionAction,
  registrarAporteExternoAction,
} from "./actions";

export default async function DonacionesPage() {
  const admin = await requireRol(Rol.ADMIN);

  const [medios, ingresos, recursos, ayudas] = await Promise.all([
    listarMediosDonacionServicio(),
    listarIngresosExternosServicio(),
    listarRecursosServicio({
      categoria: CategoriaRecurso.MONETARIO,
      soloSeleccionables: true,
    }),
    listarActividadesServicio({
      adminId: admin.id,
      estado: EstadoActividad.RECOLECTANDO,
    }),
  ]);

  const recursoIdsMonetarios = new Set(recursos.map((r) => r.id));
  const ayudasConMetaMonetaria = ayudas
    .filter((a) => a.metas.some((m) => recursoIdsMonetarios.has(m.recursoId)))
    .map((a) => ({ id: a.id, titulo: a.titulo }));

  const fechaHoy = DateTime.now().toFormat("yyyy-MM-dd");

  return (
    <PanelPage>
      <DonacionesGestion
        medios={medios}
        ingresos={ingresos}
        ingreso={{
          recursos: recursos.map((r) => ({
            id: r.id,
            nombre: r.nombre,
            unidad: r.unidad,
          })),
          medios: medios.map((m) => ({
            id: m.id,
            titular: m.titular,
            moneda: m.moneda,
          })),
          ayudas: ayudasConMetaMonetaria,
          fechaHoy,
        }}
        crearMedioAction={crearMedioDonacionAction}
        editarMedioAction={editarMedioDonacionAction}
        registrarIngresoAction={registrarAporteExternoAction}
        activarMedioAction={activarMedioDonacionAction}
        desactivarMedioAction={desactivarMedioDonacionAction}
      />
    </PanelPage>
  );
}
