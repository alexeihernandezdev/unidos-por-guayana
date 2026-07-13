import Link from "next/link";
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
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
          Crear actividad
        </h1>
        <p className="max-w-[60ch] text-sm text-muted-foreground [text-wrap:pretty]">
          Elige el tipo de actividad, define el destino y la fecha, marca los
          centros de acopio y qué recursos necesitas.
        </p>
      </div>

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

      <Link
        href="/panel/actividades"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver a las actividades
      </Link>
    </main>
  );
}
