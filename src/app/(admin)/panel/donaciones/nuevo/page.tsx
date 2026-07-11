import Link from "next/link";
import { MedioDonacionForm } from "@/modules/donaciones/ui/MedioDonacionForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";
import { crearMedioDonacionAction } from "../actions";

export default async function NuevoMedioDonacionPage() {
  await requireRol(Rol.ADMIN);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Nuevo medio de donación
        </h1>
        <p className="text-sm text-muted-foreground">
          Añade un canal externo por el que el público pueda donar dinero.
        </p>
      </div>

      <MedioDonacionForm
        action={crearMedioDonacionAction}
        textoEnviar="Crear medio"
        textoEnviando="Creando…"
      />

      <Link
        href="/panel/donaciones"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver a donaciones
      </Link>
    </main>
  );
}
