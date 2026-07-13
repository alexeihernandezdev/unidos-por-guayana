import Link from "next/link";
import { Inbox } from "lucide-react";
import { SolicitudesTabla } from "@/modules/solicitudes/ui/SolicitudesTabla";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarMisSolicitudesServicio } from "@/shared/solicitudes";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import { PanelPage, PanelPageHeader } from "@/shared/ui/panel";

export default async function MisSolicitudesPage() {
  const usuario = await requireRol(Rol.SOLICITANTE);
  const solicitudes = await listarMisSolicitudesServicio(usuario.id);

  return (
    <PanelPage>
      <PanelPageHeader
        icon={Inbox}
        eyebrow="Mis peticiones"
        title="Mis solicitudes"
        description="Peticiones de ayuda que has registrado para tu sector."
        actions={
          <Button asChild>
            <Link href="/solicitudes/nueva">Nueva solicitud</Link>
          </Button>
        }
      />

      <SolicitudesTabla solicitudes={solicitudes} baseRuta="/solicitudes" />
    </PanelPage>
  );
}
