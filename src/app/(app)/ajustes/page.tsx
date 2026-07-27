import type { Metadata } from "next";
import { Settings2 } from "lucide-react";
import { requireSesion } from "@/shared/auth";
import {
  consultarCanalesUsuarioServicio,
  consultarPreferenciasServicio,
  smtpDisponibleServicio,
} from "@/shared/notificaciones";
import { AjustesNotificaciones } from "@/modules/notificaciones/ui/AjustesNotificaciones";
import { PanelPage, PanelPageHeader } from "@/shared/ui/panel";
import {
  actualizarPreferenciaAction,
  enviarCorreoPruebaAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Ajustes | Unidos por Guayana",
};

export const runtime = "nodejs";

export default async function AjustesPage() {
  const usuario = await requireSesion();
  const [preferencias, canales] = await Promise.all([
    consultarPreferenciasServicio(usuario.id, usuario.rol),
    consultarCanalesUsuarioServicio(usuario.id),
  ]);

  return (
    <PanelPage>
      <PanelPageHeader
        animated
        icon={Settings2}
        eyebrow="Mi cuenta"
        title="Ajustes"
        description="Elige qué avisos quieres recibir por Email y WhatsApp. Las notificaciones dentro de la plataforma siempre estarán disponibles."
      />
      <AjustesNotificaciones
        iniciales={preferencias}
        email={canales.email}
        smtpDisponible={smtpDisponibleServicio()}
        whatsappDisponible={canales.whatsappDisponible}
        actualizarAction={actualizarPreferenciaAction}
        probarEmailAction={enviarCorreoPruebaAction}
      />
    </PanelPage>
  );
}
