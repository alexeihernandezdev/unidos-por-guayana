import type { TipoNotificacion } from "./TipoNotificacion";
import type { Rol } from "@/modules/usuarios/domain/Rol";

// Entidad de dominio del aviso in-app (feature 012). Pura: fechas `Date` en UTC.
// La `referencia` es un par `(referenciaTipo, referenciaId)` en vez de una FK
// rígida, para poder apuntar a distintas entidades sin migrar la tabla.
export type Notificacion = {
  id: string;
  usuarioId: string;
  tipo: TipoNotificacion;
  mensaje: string;
  referenciaTipo: string;
  referenciaId: string;
  leida: boolean;
  claveDedupe: string;
  createdAt: Date;
};

// Datos para crear una notificación. `leida` nace en `false`; `id`/`createdAt` los
// pone la persistencia.
export type NuevaNotificacion = {
  usuarioId: string;
  tipo: TipoNotificacion;
  mensaje: string;
  referenciaTipo: string;
  referenciaId: string;
  claveDedupe: string;
};

// Contacto multicanal del destinatario. El teléfono efectivo del ADMIN vive en
// PerfilAdmin; email, nombre y rol siempre provienen de Usuario.
export type ContactoDestinatario = {
  usuarioId: string;
  nombre: string;
  email: string;
  rol: Rol;
  telefono: string | null;
  telefonoEsWhatsApp: boolean;
};
