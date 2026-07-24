import type { TipoNotificacion } from "./TipoNotificacion";

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

// Contacto de un destinatario para el canal WhatsApp (feature 012). Lo resuelve un
// `LectorContacto`: para el ADMIN el teléfono vive en su `PerfilAdmin`; para el
// resto en el propio `Usuario`.
export type ContactoDestinatario = {
  usuarioId: string;
  telefono: string | null;
  telefonoEsWhatsApp: boolean;
};
