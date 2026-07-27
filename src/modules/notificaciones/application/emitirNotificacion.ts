import type { NuevaNotificacion } from "@/modules/notificaciones/domain/Notificacion";
import type { EventoNotificacion } from "@/modules/notificaciones/domain/NotificadorPort";
import {
  claveDedupe,
  componerMensaje,
  asuntoDeEvento,
  hrefDeReferencia,
  referenciaDeEvento,
  variablesPlantilla,
} from "@/modules/notificaciones/domain/reglas";
import { canalActivo } from "@/modules/notificaciones/domain";
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
  {
    notificaciones,
    contactos,
    canalWhatsApp,
    canalEmail,
    preferencias,
  }: EmitirDeps,
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
    const referencia = referenciaDeEvento(evento);
    const filas: NuevaNotificacion[] = nuevos.map((usuarioId) => ({
      usuarioId,
      tipo: evento.tipo,
      mensaje,
      referenciaTipo: referencia.tipo || REFERENCIA_TIPO,
      referenciaId: referencia.id,
      claveDedupe: clave,
    }));
    await notificaciones.crearMuchas(filas);

    const variables = variablesPlantilla(evento);
    const [contactosNuevos, preferenciasGuardadas] = await Promise.all([
      contactos.contactoDe(nuevos),
      preferencias.listarPorUsuarios(nuevos),
    ]);
    const preferenciasPorUsuario = new Map(
      preferenciasGuardadas
        .filter((p) => p.tipo === evento.tipo)
        .map((p) => [p.usuarioId, p]),
    );
    const tareas: Array<{
      canal: "EMAIL" | "WHATSAPP";
      usuarioId: string;
      promesa: Promise<void>;
    }> = [];
    for (const contacto of contactosNuevos) {
      const preferencia = preferenciasPorUsuario.get(contacto.usuarioId);
      if (
        canalActivo(preferencia, "WHATSAPP") &&
        contacto.telefonoEsWhatsApp &&
        contacto.telefono
      ) {
        tareas.push({
          canal: "WHATSAPP",
          usuarioId: contacto.usuarioId,
          promesa: canalWhatsApp.enviar({
            telefonoE164: contacto.telefono,
            tipo: evento.tipo,
            variables,
          }),
        });
      }
      if (canalActivo(preferencia, "EMAIL") && contacto.email) {
        tareas.push({
          canal: "EMAIL",
          usuarioId: contacto.usuarioId,
          promesa: canalEmail.enviar({
            email: contacto.email,
            nombre: contacto.nombre,
            tipo: evento.tipo,
            asunto: asuntoDeEvento(evento),
            mensaje,
            href: hrefDeReferencia(
              contacto.rol,
              referencia.tipo,
              referencia.id,
            ),
          }),
        });
      }
    }
    const resultados = await Promise.allSettled(
      tareas.map((tarea) => tarea.promesa),
    );
    resultados.forEach((resultado, indice) => {
      if (resultado.status === "rejected") {
        const tarea = tareas[indice];
        console.error(
          `[notificaciones] Falló ${tarea.canal} para ${tarea.usuarioId} (${evento.tipo}).`,
        );
      }
    });
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
