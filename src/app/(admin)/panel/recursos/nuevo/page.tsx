import Link from "next/link";
import { RecursoForm } from "@/modules/recursos/ui/RecursoForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";
import { crearRecursoAction } from "../actions";

export default async function NuevoRecursoPage() {
  await requireRol(Rol.ADMIN);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo recurso</h1>
        <p className="text-sm text-muted-foreground">
          Añade un recurso al catálogo.
        </p>
      </div>

      <RecursoForm
        action={crearRecursoAction}
        textoEnviar="Crear recurso"
        textoEnviando="Creando…"
      />

      <Link
        href="/panel/recursos"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver al catálogo
      </Link>
    </main>
  );
}
