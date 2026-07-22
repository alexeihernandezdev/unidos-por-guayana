import Link from "next/link";
import { Inbox } from "lucide-react";
import { SolicitudesGrid } from "@/modules/solicitudes/ui/SolicitudesGrid";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  cargarPortadasServicio,
  listarMisSolicitudesServicio,
} from "@/shared/solicitudes";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import { PanelPage, PanelPageHeader } from "@/shared/ui/panel";

export default async function MisSolicitudesPage() {
  const usuario = await requireRol(Rol.SOLICITANTE);
  const solicitudes = await listarMisSolicitudesServicio(usuario.id);
  const portadas = await cargarPortadasServicio(solicitudes);

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

      <SolicitudesGrid
        solicitudes={solicitudes}
        baseRuta="/solicitudes"
        portadas={portadas}
      />
    </PanelPage>
  );
}
