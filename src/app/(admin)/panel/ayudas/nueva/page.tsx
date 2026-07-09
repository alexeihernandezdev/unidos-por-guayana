import Link from "next/link";
import { AyudaForm } from "@/modules/ayudas/ui/AyudaForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarRecursosServicio } from "@/shared/recursos";
import { requireRol } from "@/shared/auth";
import { crearAyudaAction } from "../actions";

export default async function NuevaAyudaPage() {
  await requireRol(Rol.ADMIN);

  // Solo se pueden elegir recursos activos del catálogo para las metas (feature 004).
  const recursos = await listarRecursosServicio({ soloActivos: true });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo envío</h1>
        <p className="text-sm text-muted-foreground">
          Define el destino, la fecha de salida y las metas de recursos.
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
        textoEnviar="Crear envío"
        textoEnviando="Creando…"
      />

      <Link
        href="/panel/ayudas"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver a los envíos
      </Link>
    </main>
  );
}
