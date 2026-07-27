import type { CanalEmail } from "@/modules/notificaciones/domain/CanalEmail";
import type { LectorContacto } from "@/modules/notificaciones/domain/LectorContacto";

export async function probarCanalEmail(
  deps: { contactos: LectorContacto; canalEmail: CanalEmail },
  usuarioId: string,
): Promise<void> {
  if (!deps.canalEmail.disponible()) {
    throw new Error("El servicio SMTP todavía no está configurado.");
  }
  const [contacto] = await deps.contactos.contactoDe([usuarioId]);
  if (!contacto?.email) {
    throw new Error("Tu cuenta no tiene un correo registrado.");
  }
  await deps.canalEmail.enviarPrueba({
    email: contacto.email,
    nombre: contacto.nombre,
  });
}
