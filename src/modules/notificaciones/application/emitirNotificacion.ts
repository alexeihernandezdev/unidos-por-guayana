import type { NuevaNotificacion } from "@/modules/notificaciones/domain/Notificacion";
import type { EventoNotificacion } from "@/modules/notificaciones/domain/NotificadorPort";
import {
  claveDedupe,
  componerMensaje,
  variablesPlantilla,
} from "@/modules/notificaciones/domain/reglas";
import type { EmitirDeps } from "./deps";

const REFERENCIA_TIPO = "ACTIVIDAD";

/**
 * Emite un aviso por los dos canales (feature 012):
 *
 * 1. Deduplica: consulta qué destinatarios ya tienen la `claveDedupe` de este
 *    evento y solo crea la notificación in-app para los **nuevos**.
 * 2. Persiste in-app con `crearMuchas` (idempotente por `@@unique`).
 * 3. Envía por WhatsApp, best-effort y en paralelo, solo a los nuevos destinatarios
 *    con `telefonoEsWhatsApp` y teléfono. Un fallo de WhatsApp se traga (se ha
 *    intentado); nunca se propaga a la operación de negocio.
 *
 * Toda la función es best-effort: cualquier error se captura para no romper al
 * emisor (crear actividad / marcar recibido).
 */
export async function emitirNotificacion(
  { notificaciones, contactos, canalWhatsApp }: EmitirDeps,
  evento: EventoNotificacion,
): Promise<void> {
  try {
    const destinatarios = [...new Set(evento.destinatarioIds)];
    if (destinatarios.length === 0) return;

    const clave = claveDedupe(evento);
    const yaTienen = new Set(await notificaciones.usuariosConClave(clave));
    const nuevos = destinatarios.filter((id) => !yaTienen.has(id));
    if (nuevos.length === 0) return;

    const mensaje = componerMensaje(evento);
    const filas: NuevaNotificacion[] = nuevos.map((usuarioId) => ({
      usuarioId,
      tipo: evento.tipo,
      mensaje,
      referenciaTipo: REFERENCIA_TIPO,
      referenciaId: evento.actividadId,
      claveDedupe: clave,
    }));
    await notificaciones.crearMuchas(filas);

    // Canal WhatsApp: solo destinatarios nuevos con WhatsApp. El adaptador es no-op
    // si Meta no está configurado, así que llamar siempre es seguro.
    const variables = variablesPlantilla(evento);
    const contactosNuevos = await contactos.contactoDe(nuevos);
    await Promise.allSettled(
      contactosNuevos
        .filter((c) => c.telefonoEsWhatsApp && c.telefono)
        .map((c) =>
          canalWhatsApp.enviar({
            telefonoE164: c.telefono as string,
            tipo: evento.tipo,
            variables,
          }),
        ),
    );
  } catch (error) {
    // Best-effort: registrar y seguir. El aviso no puede tumbar el negocio.
    console.error("[notificaciones] Falló la emisión del aviso:", error);
  }
}

/**
 * Construye un `NotificadorPort` a partir de sus dependencias. Lo usa el
 * composition root (`@/lib/notificaciones`) para inyectarlo en 024 y 006.
 */
export function crearNotificador(deps: EmitirDeps) {
  return {
    emitir: (evento: EventoNotificacion) => emitirNotificacion(deps, evento),
  };
}
