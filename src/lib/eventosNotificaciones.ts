import { prisma } from "@/lib/prisma";
import { notificador } from "@/lib/notificaciones";
import type { Aporte } from "@/modules/aportes/domain/Aporte";
import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import type { Recurso } from "@/modules/recursos/domain/Recurso";
import type { Testimonio } from "@/modules/testimonios/domain";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import {
  EstadoVerificacion,
  Rol,
  type Rol as RolType,
} from "@/modules/usuarios/domain/Rol";
import { TipoNotificacion } from "@/modules/notificaciones/domain/TipoNotificacion";
import type { EventoNotificacionDirecto } from "@/modules/notificaciones/domain/NotificadorPort";

type Directo = EventoNotificacionDirecto;

function evento(input: Omit<Directo, "directo">): Directo {
  return { directo: true, ...input } as Directo;
}

export async function notificarNuevoAporte(aporte: Aporte): Promise<void> {
  if (!aporte.actividadId || !aporte.colaboradorId) return;
  const actividad = await prisma.actividad.findUnique({
    where: { id: aporte.actividadId },
    select: {
      adminId: true,
      titulo: true,
      metas: {
        where: { recursoId: aporte.recursoId },
        select: { recurso: { select: { nombre: true } } },
      },
    },
  });
  if (!actividad) return;
  const colaborador = aporte.colaborador?.nombre ?? "Un colaborador";
  const recurso = actividad.metas[0]?.recurso.nombre ?? "un recurso";
  const mensaje = `${colaborador} registró un aporte de ${aporte.cantidad} para ${recurso} en ${actividad.titulo}.`;
  await notificador.emitir(
    evento({
      tipo: TipoNotificacion.NUEVO_APORTE,
      destinatarioIds: [actividad.adminId],
      mensaje,
      asunto: `Nuevo aporte para ${actividad.titulo}`,
      referenciaTipo: "ACTIVIDAD",
      referenciaId: aporte.actividadId,
      claveDedupe: `NUEVO_APORTE:APORTE:${aporte.id}`,
      variablesWhatsApp: [mensaje],
    }),
  );
}

export async function notificarEstadoAporte(
  aporte: Aporte,
  actorRol: RolType,
  resultado: "RECIBIDO" | "CANCELADO",
): Promise<void> {
  if (
    actorRol !== Rol.ADMIN ||
    !aporte.actividadId ||
    !aporte.colaboradorId
  ) {
    return;
  }
  const actividad = await prisma.actividad.findUnique({
    where: { id: aporte.actividadId },
    select: { titulo: true },
  });
  const estado = resultado === "RECIBIDO" ? "recibido" : "cancelado";
  const mensaje = `Tu aporte para ${actividad?.titulo ?? "una actividad"} fue marcado como ${estado}.`;
  await notificador.emitir(
    evento({
      tipo: TipoNotificacion.ESTADO_APORTE,
      destinatarioIds: [aporte.colaboradorId],
      mensaje,
      asunto: `Tu aporte fue ${estado}`,
      referenciaTipo: "ACTIVIDAD",
      referenciaId: aporte.actividadId,
      claveDedupe: `ESTADO_APORTE:APORTE:${aporte.id}:${resultado}`,
      variablesWhatsApp: [mensaje],
    }),
  );
}

export async function notificarNuevaAfiliacion(
  adminId: string,
  colaboradorId: string,
  afiliacionId: string,
): Promise<void> {
  const colaborador = await prisma.usuario.findUnique({
    where: { id: colaboradorId },
    select: { nombre: true },
  });
  const mensaje = `${colaborador?.nombre ?? "Un colaborador"} se unió a tu red de colaboración.`;
  await notificador.emitir(
    evento({
      tipo: TipoNotificacion.NUEVA_AFILIACION,
      destinatarioIds: [adminId],
      mensaje,
      asunto: "Nuevo integrante en tu red",
      referenciaTipo: "AFILIACION",
      referenciaId: afiliacionId,
      claveDedupe: `NUEVA_AFILIACION:AFILIACION:${afiliacionId}`,
      variablesWhatsApp: [mensaje],
    }),
  );
}

export async function notificarAfiliacionRemovida(
  adminId: string,
  colaboradorId: string,
  afiliacionId: string,
): Promise<void> {
  const perfil = await prisma.perfilAdmin.findUnique({
    where: { usuarioId: adminId },
    select: { nombreCuenta: true },
  });
  const mensaje = `${perfil?.nombreCuenta ?? "Un centro"} te retiró de su red de colaboración.`;
  await notificador.emitir(
    evento({
      tipo: TipoNotificacion.AFILIACION_REMOVIDA,
      destinatarioIds: [colaboradorId],
      mensaje,
      asunto: "Cambio en tu red de colaboración",
      referenciaTipo: "AFILIACION",
      referenciaId: adminId,
      claveDedupe: `AFILIACION_REMOVIDA:AFILIACION:${afiliacionId}`,
      variablesWhatsApp: [mensaje],
    }),
  );
}

export async function notificarNuevaSolicitud(
  solicitud: Solicitud,
): Promise<void> {
  const [admins, auditores] = await Promise.all([
    prisma.usuario.findMany({
      where: {
        rol: Rol.ADMIN,
        estadoVerificacion: EstadoVerificacion.VERIFICADO,
        perfilAdmin: { municipioId: solicitud.municipioId },
      },
      select: { id: true },
    }),
    prisma.usuario.findMany({
      where: {
        rol: Rol.AUDITOR,
        estadoVerificacion: EstadoVerificacion.VERIFICADO,
      },
      select: { id: true },
    }),
  ]);
  const mensajeZona = `Nueva solicitud de ayuda en ${solicitud.sector}, ${solicitud.municipioNombre}.`;
  await Promise.all([
    notificador.emitir(
      evento({
        tipo: TipoNotificacion.NUEVA_SOLICITUD_ZONA,
        destinatarioIds: admins.map((item) => item.id),
        mensaje: mensajeZona,
        asunto: `Nueva solicitud en ${solicitud.municipioNombre}`,
        referenciaTipo: "SOLICITUD",
        referenciaId: solicitud.id,
        claveDedupe: `NUEVA_SOLICITUD_ZONA:SOLICITUD:${solicitud.id}`,
        variablesWhatsApp: [mensajeZona],
      }),
    ),
    notificador.emitir(
      evento({
        tipo: TipoNotificacion.NUEVA_SOLICITUD_AUDITABLE,
        destinatarioIds: auditores.map((item) => item.id),
        mensaje: `La solicitud de ${solicitud.sector} está disponible para auditoría.`,
        asunto: "Nueva solicitud disponible para auditoría",
        referenciaTipo: "SOLICITUD",
        referenciaId: solicitud.id,
        claveDedupe: `NUEVA_SOLICITUD_AUDITABLE:SOLICITUD:${solicitud.id}`,
        variablesWhatsApp: [solicitud.sector],
      }),
    ),
  ]);
}

export async function notificarEstadoSolicitud(
  solicitud: Solicitud,
): Promise<void> {
  const estado = solicitud.estado === "ATENDIDA" ? "atendida" : "cerrada";
  const mensaje = `Tu solicitud de ${solicitud.sector} fue marcada como ${estado}.`;
  await notificador.emitir(
    evento({
      tipo: TipoNotificacion.ESTADO_SOLICITUD,
      destinatarioIds: [solicitud.solicitanteId],
      mensaje,
      asunto: `Tu solicitud fue ${estado}`,
      referenciaTipo: "SOLICITUD",
      referenciaId: solicitud.id,
      claveDedupe: `ESTADO_SOLICITUD:SOLICITUD:${solicitud.id}:${solicitud.estado}`,
      variablesWhatsApp: [mensaje],
    }),
  );
}

export async function notificarActualizacionAuditoria(
  solicitudId: string,
  solicitanteId: string,
  estado: string,
  ciclo: number,
): Promise<void> {
  const etiquetas: Record<string, string> = {
    REQUIERE_INFORMACION: "necesita información adicional",
    VERIFICADA: "fue verificada",
    NO_VERIFICADA: "no pudo ser verificada",
  };
  const detalle = etiquetas[estado] ?? "fue actualizada";
  const mensaje = `La auditoría de tu solicitud ${detalle}.`;
  await notificador.emitir(
    evento({
      tipo: TipoNotificacion.ACTUALIZACION_AUDITORIA,
      destinatarioIds: [solicitanteId],
      mensaje,
      asunto: "Actualización de auditoría",
      referenciaTipo: "SOLICITUD",
      referenciaId: solicitudId,
      claveDedupe: `ACTUALIZACION_AUDITORIA:SOLICITUD:${solicitudId}:${ciclo}:${estado}`,
      variablesWhatsApp: [mensaje],
    }),
  );
}

export async function notificarResultadoRecurso(
  recurso: Recurso,
): Promise<void> {
  if (!recurso.propuestoPorId) return;
  const resultado =
    recurso.estadoAprobacion === "APROBADO" ? "aprobado" : "rechazado";
  const mensaje = `Tu propuesta de recurso “${recurso.nombre}” fue ${resultado}.`;
  await notificador.emitir(
    evento({
      tipo: TipoNotificacion.RESULTADO_PROPUESTA_RECURSO,
      destinatarioIds: [recurso.propuestoPorId],
      mensaje,
      asunto: `Recurso propuesto ${resultado}`,
      referenciaTipo: "RECURSO",
      referenciaId: recurso.id,
      claveDedupe: `RESULTADO_PROPUESTA_RECURSO:RECURSO:${recurso.id}:${recurso.estadoAprobacion}`,
      variablesWhatsApp: [mensaje],
    }),
  );
}

export async function notificarResultadoTestimonio(
  testimonio: Testimonio,
): Promise<void> {
  const resultado = testimonio.estado === "APROBADO" ? "aprobado" : "rechazado";
  const mensaje = `Tu testimonio “${testimonio.titulo}” fue ${resultado}.`;
  await notificador.emitir(
    evento({
      tipo: TipoNotificacion.RESULTADO_TESTIMONIO,
      destinatarioIds: [testimonio.autorId],
      mensaje,
      asunto: `Testimonio ${resultado}`,
      referenciaTipo: "TESTIMONIO",
      referenciaId: testimonio.id,
      claveDedupe: `RESULTADO_TESTIMONIO:TESTIMONIO:${testimonio.id}:${testimonio.estado}`,
      variablesWhatsApp: [mensaje],
    }),
  );
}

export async function notificarNuevoAdminPendiente(
  admin: Usuario,
): Promise<void> {
  const superadmins = await prisma.usuario.findMany({
    where: { rol: Rol.SUPERADMIN },
    select: { id: true },
  });
  const mensaje = `${admin.nombre} registró una cuenta administradora pendiente de revisión.`;
  await notificador.emitir(
    evento({
      tipo: TipoNotificacion.NUEVO_ADMIN_PENDIENTE,
      destinatarioIds: superadmins.map((item) => item.id),
      mensaje,
      asunto: "Nueva cuenta administradora pendiente",
      referenciaTipo: "ADMIN",
      referenciaId: admin.id,
      claveDedupe: `NUEVO_ADMIN_PENDIENTE:ADMIN:${admin.id}`,
      variablesWhatsApp: [mensaje],
    }),
  );
}

export async function notificarEstadoCuentaAdmin(
  admin: Usuario,
): Promise<void> {
  const resultado =
    admin.estadoVerificacion === EstadoVerificacion.VERIFICADO
      ? "aprobada"
      : "rechazada";
  const mensaje = `Tu cuenta administradora fue ${resultado}.`;
  await notificador.emitir(
    evento({
      tipo: TipoNotificacion.ESTADO_CUENTA_ADMIN,
      destinatarioIds: [admin.id],
      mensaje,
      asunto: `Cuenta administradora ${resultado}`,
      referenciaTipo: "ADMIN",
      referenciaId: admin.id,
      claveDedupe: `ESTADO_CUENTA_ADMIN:ADMIN:${admin.id}:${admin.estadoVerificacion}`,
      variablesWhatsApp: [mensaje],
    }),
  );
}
