import Link from "next/link";
import { SolicitudForm } from "@/modules/solicitudes/ui/SolicitudForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarRecursosServicio } from "@/shared/recursos";
import { requireRol } from "@/shared/auth";
import { crearSolicitudAction } from "../actions";

export default async function NuevaSolicitudPage() {
  await requireRol(Rol.SOLICITANTE);

  const recursos = (
    await listarRecursosServicio({ soloSeleccionables: true })
  ).map(
    (r) => ({
      id: r.id,
      nombre: r.nombre,
      unidad: r.unidad,
    }),
  );

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Nueva solicitud de ayuda
        </h1>
        <p className="text-sm text-muted-foreground">
          Indica tu sector, la urgencia y qué recursos necesitas.
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        ¿No ves el recurso que necesitas?{" "}
        <Link
          href="/solicitudes/proponer-recurso"
          className="text-primary underline-offset-4 hover:underline"
        >
          Propón uno nuevo al catálogo
        </Link>
        .
      </p>

      <SolicitudForm
        action={crearSolicitudAction}
        recursos={recursos}
        textoEnviar="Crear solicitud"
        textoEnviando="Creando…"
        rutaExito="/solicitudes"
      />
    </main>
  );
}
