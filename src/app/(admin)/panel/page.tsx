import { DispatchStrip } from "@/modules/admin/ui";
import { PanelResumen } from "@/modules/panel/ui";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";
import { obtenerResumenPanelServicio } from "@/shared/panel";

export default async function PanelPage() {
  await requireRol(Rol.ADMIN);

  const resumen = await obtenerResumenPanelServicio();

  const partes: string[] = [];
  if (resumen.enviosPorEstado.RECOLECTANDO > 0) {
    partes.push(`${resumen.enviosPorEstado.RECOLECTANDO} por preparar`);
  }
  if (resumen.enviosPorEstado.LISTO > 0) {
    partes.push(`${resumen.enviosPorEstado.LISTO} listos para salir`);
  }
  if (resumen.solicitudesAbiertasPorUrgencia.ALTA > 0) {
    partes.push(
      `${resumen.solicitudesAbiertasPorUrgencia.ALTA} solicitudes urgentes`,
    );
  }
  if (resumen.aportesPendientesConteo > 0) {
    partes.push(`${resumen.aportesPendientesConteo} aportes por confirmar`);
  }

  return (
    <>
      <DispatchStrip
        resumen={partes.length > 0 ? partes.join(", ") : undefined}
      />
      <PanelResumen resumen={resumen} />
    </>
  );
}
