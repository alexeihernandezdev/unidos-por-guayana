import Link from "next/link";
import {
  TipoActividad,
  esTipoActividad,
} from "@/modules/ayudas/domain/TipoActividad";
import { AyudaForm } from "@/modules/ayudas/ui/AyudaForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarRecursosServicio } from "@/shared/recursos";
import { requireRol } from "@/shared/auth";
import { crearAyudaAction } from "../actions";

type Props = {
  searchParams: Promise<{ tipo?: string }>;
};

export default async function NuevaAyudaPage({ searchParams }: Props) {
  await requireRol(Rol.ADMIN);

  const { tipo } = await searchParams;
  const tipoInicial =
    tipo && esTipoActividad(tipo) ? tipo : TipoActividad.ENVIO;

  // Solo se pueden elegir recursos activos del catálogo para las metas (feature 004).
  // Solo recursos APROBADO + activos son seleccionables (features 004, 019).
  const recursos = await listarRecursosServicio({ soloSeleccionables: true });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Crear actividad
        </h1>
        <p className="text-sm text-muted-foreground">
          Elige el tipo de actividad, define el destino, la fecha y las metas de
          recursos.
        </p>
      </div>

      <AyudaForm
        action={crearAyudaAction}
        recursos={recursos.map((r) => ({
          id: r.id,
          nombre: r.nombre,
          unidad: r.unidad,
        }))}
        conMetas
        valoresIniciales={{ tipo: tipoInicial }}
        textoEnviar="Crear actividad"
        textoEnviando="Creando…"
      />

      <Link
        href="/panel/ayudas"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver a las actividades
      </Link>
    </main>
  );
}
