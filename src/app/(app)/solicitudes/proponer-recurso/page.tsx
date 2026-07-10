import Link from "next/link";
import { ProponerRecursoForm } from "@/modules/recursos/ui/ProponerRecursoForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";
import { proponerRecursoAction } from "../actions";

export default async function ProponerRecursoPage() {
  await requireRol(Rol.SOLICITANTE);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Proponer un recurso al catálogo
        </h1>
        <p className="text-sm text-muted-foreground">
          Si el recurso que necesitas todavía no está listado, propónlo aquí. El
          equipo lo revisará antes de incorporarlo.
        </p>
      </div>

      <ProponerRecursoForm
        action={proponerRecursoAction}
        rutaExito="/solicitudes/nueva"
      />

      <Link
        href="/solicitudes/nueva"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver a la solicitud
      </Link>
    </main>
  );
}
