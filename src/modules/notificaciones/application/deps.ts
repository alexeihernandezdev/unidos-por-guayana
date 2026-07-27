import type { CanalWhatsApp } from "@/modules/notificaciones/domain/CanalWhatsApp";
import type { CanalEmail } from "@/modules/notificaciones/domain/CanalEmail";
import type { LectorContacto } from "@/modules/notificaciones/domain/LectorContacto";
import type { NotificacionRepository } from "@/modules/notificaciones/domain/NotificacionRepository";
import type { PreferenciaNotificacionRepository } from "@/modules/notificaciones/domain";

// Dependencias de la emisión de notificaciones (feature 012). Solo contratos de
// dominio: la capa se mantiene pura.
export type EmitirDeps = {
  notificaciones: NotificacionRepository;
  contactos: LectorContacto;
  canalWhatsApp: CanalWhatsApp;
  canalEmail: CanalEmail;
  preferencias: PreferenciaNotificacionRepository;
};

// Dependencias de las lecturas / marcado (bandeja y campana).
export type ConsultarDeps = {
  notificaciones: NotificacionRepository;
};
