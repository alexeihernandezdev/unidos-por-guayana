import Link from "next/link";
import { PropuestasTabla } from "@/modules/recursos/ui/PropuestasTabla";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarPropuestasServicio } from "@/shared/recursos";
import { requireRol } from "@/shared/auth";
import {
  aprobarPropuestaAction,
  rechazarPropuestaAction,
} from "../actions";

export default async function PropuestasRecursosPage() {
  await requireRol(Rol.ADMIN);

  const propuestas = await listarPropuestasServicio();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Propuestas de recursos
        </h1>
        <p className="text-sm text-muted-foreground">
          Recursos propuestos por solicitantes. Aprueba para incorporarlos al
          catálogo o rechaza para descartarlos.
        </p>
      </div>

      <PropuestasTabla
        propuestas={propuestas}
        aprobarAction={aprobarPropuestaAction}
        rechazarAction={rechazarPropuestaAction}
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
