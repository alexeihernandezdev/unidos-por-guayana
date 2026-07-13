import {
  TipoActividad,
  esTipoActividad,
} from "@/modules/actividades/domain/TipoActividad";
import { ActividadForm } from "@/modules/actividades/ui/ActividadForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarPuntosDeAdminServicio } from "@/shared/acopio";
import {
  contarAptosPorCategoriaServicio,
  listarRedAptaPorCategoriaServicio,
} from "@/shared/afiliaciones";
import { listarRecursosServicio } from "@/shared/recursos";
import { requireRol } from "@/shared/auth";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";
import { crearActividadAction } from "../actions";

type Props = {
  searchParams: Promise<{ tipo?: string }>;
};

export default async function NuevaActividadPage({ searchParams }: Props) {
  const sesion = await requireRol(Rol.ADMIN);

  const { tipo } = await searchParams;
  const tipoInicial =
    tipo && esTipoActividad(tipo) ? tipo : TipoActividad.ENVIO;

  // Solo se pueden elegir recursos activos del catálogo para las metas (feature 004).
  // Solo recursos APROBADO + activos son seleccionables (features 004, 019).
  const recursos = await listarRecursosServicio({ soloSeleccionables: true });
  // Puntos de acopio activos del propio ADMIN para asociar uno (opcional, feature 024).
  const puntos = await listarPuntosDeAdminServicio(sesion.id, { activo: true });
  // Conteo de aptos por categoría de la red del admin (feature 025) y la lista
  // agrupada para el botón "+ info" (feature 026).
  const [conteos, redPorCategoria] = await Promise.all([
    contarAptosPorCategoriaServicio(sesion.id),
    listarRedAptaPorCategoriaServicio(sesion.id),
  ]);

  return (
    <PanelPage>
      <PanelPageSubHeader
        title="Crear actividad"
        description="Elige el tipo de actividad, define el destino y la fecha, marca los centros de acopio y qué recursos necesitas."
        backHref="/panel/actividades"
        backLabel="Volver a las actividades"
      />

      <ActividadForm
        action={crearActividadAction}
        recursos={recursos.map((r) => ({
          id: r.id,
          nombre: r.nombre,
          unidad: r.unidad,
          categoria: r.categoria,
        }))}
        puntosAcopio={puntos.map((p) => ({ id: p.id, nombre: p.nombre }))}
        conteosPorCategoria={conteos}
        redPorCategoria={redPorCategoria}
        conMetas
        valoresIniciales={{ tipo: tipoInicial }}
        textoEnviar="Crear actividad"
        textoEnviando="Creando…"
      />
    </PanelPage>
  );
}
