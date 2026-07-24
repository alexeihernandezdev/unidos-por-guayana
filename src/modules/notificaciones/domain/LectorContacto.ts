import type { ContactoDestinatario } from "./Notificacion";

/**
 * Puerto para resolver el contacto de un conjunto de destinatarios (feature 012).
 * La implementación (Prisma) elige el teléfono correcto por rol: el del
 * `PerfilAdmin` para el ADMIN, el del `Usuario` para el resto. Devuelve solo los
 * usuarios encontrados (los que no existan se omiten).
 */
export interface LectorContacto {
  contactoDe(usuarioIds: readonly string[]): Promise<ContactoDestinatario[]>;
}
