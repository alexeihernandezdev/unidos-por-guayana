import { Bell } from "lucide-react";
import { formatearFecha, hrefDeNotificacion } from "@/modules/notificaciones/ui/formato";
import { NotificacionesLista } from "@/modules/notificaciones/ui/NotificacionesLista";
import { requireSesion } from "@/shared/auth";
import { listarNotificacionesServicio } from "@/shared/notificaciones";
import { PanelPage, PanelPageHeader } from "@/shared/ui/panel";

// Bandeja de notificaciones del usuario logeado (feature 012). Accesible a cualquier
// rol con sesión; vive en el route group (app) para heredar el shell (sidebar +
// cabecera con campana). Las acciones de marcado revalidan esta ruta y el contador.
export default async function NotificacionesPage() {
  const sesion = await requireSesion();
  const notificaciones = await listarNotificacionesServicio(sesion.id, {
    limite: 100,
  });

  const items = notificaciones.map((n) => ({
    id: n.id,
    mensaje: n.mensaje,
    fecha: formatearFecha(n.createdAt),
    leida: n.leida,
    href: hrefDeNotificacion(sesion.rol, n),
  }));

  return (
    <PanelPage>
      <PanelPageHeader
        animated
        icon={Bell}
        eyebrow="Avisos"
        title="Notificaciones"
        description="Lo que ha pasado en las actividades donde puedes ayudar y en las metas que sigues."
      />
      <NotificacionesLista items={items} />
    </PanelPage>
  );
}
