import Link from "next/link";
import { SolicitudesTabla } from "@/modules/solicitudes/ui/SolicitudesTabla";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarMisSolicitudesServicio } from "@/shared/solicitudes";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";

export default async function MisSolicitudesPage() {
  const usuario = await requireRol(Rol.SOLICITANTE);
  const solicitudes = await listarMisSolicitudesServicio(usuario.id);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Mis solicitudes
          </h1>
          <p className="text-sm text-muted-foreground">
            Peticiones de ayuda que has registrado para tu sector.
          </p>
        </div>
        <Button asChild>
          <Link href="/solicitudes/nueva">Nueva solicitud</Link>
        </Button>
      </div>

      <SolicitudesTabla solicitudes={solicitudes} baseRuta="/solicitudes" />
    </main>
  );
}
