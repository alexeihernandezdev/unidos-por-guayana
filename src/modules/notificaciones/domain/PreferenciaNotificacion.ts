import { Rol, type Rol as RolType } from "@/modules/usuarios/domain/Rol";
import {
  TipoNotificacion,
  type TipoNotificacion as TipoNotificacionType,
} from "./TipoNotificacion";

export type CanalExterno = "EMAIL" | "WHATSAPP";

export type PreferenciaNotificacion = {
  usuarioId: string;
  tipo: TipoNotificacionType;
  emailActivo: boolean;
  whatsappActivo: boolean;
};

export type PreferenciaVista = {
  tipo: TipoNotificacionType;
  titulo: string;
  descripcion: string;
  emailActivo: boolean;
  whatsappActivo: boolean;
};

const DESCRIPCIONES: Record<
  TipoNotificacionType,
  { titulo: string; descripcion: string }
> = {
  NUEVA_ACTIVIDAD: {
    titulo: "Nueva actividad compatible",
    descripcion: "Cuando un centro de tu red publica una actividad que necesita lo que puedes aportar.",
  },
  META_CUMPLIDA: {
    titulo: "Meta cumplida",
    descripcion: "Cuando una meta de recursos en la que participas alcanza el 100 %.",
  },
  NUEVO_APORTE: {
    titulo: "Nuevo aporte",
    descripcion: "Cuando una persona registra un aporte para una de tus actividades.",
  },
  ESTADO_APORTE: {
    titulo: "Estado de mi aporte",
    descripcion: "Cuando el centro confirma la recepción o cancela uno de tus aportes.",
  },
  NUEVA_AFILIACION: {
    titulo: "Nuevo integrante en mi red",
    descripcion: "Cuando un colaborador decide unirse a tu centro.",
  },
  AFILIACION_REMOVIDA: {
    titulo: "Cambio en mi afiliación",
    descripcion: "Cuando un centro te retira de su red de colaboración.",
  },
  NUEVA_SOLICITUD_ZONA: {
    titulo: "Nueva solicitud en mi zona",
    descripcion: "Cuando se publica una solicitud en el mismo municipio de tu centro.",
  },
  ESTADO_SOLICITUD: {
    titulo: "Estado de mi solicitud",
    descripcion: "Cuando una solicitud tuya es atendida o cerrada por un centro.",
  },
  ACTUALIZACION_AUDITORIA: {
    titulo: "Actualización de auditoría",
    descripcion: "Cuando una auditoría solicita información o emite un resultado sobre tu solicitud.",
  },
  NUEVA_SOLICITUD_AUDITABLE: {
    titulo: "Nueva solicitud para auditar",
    descripcion: "Cuando una solicitud nueva entra en la cola de verificación.",
  },
  RESULTADO_PROPUESTA_RECURSO: {
    titulo: "Resultado de recurso propuesto",
    descripcion: "Cuando se aprueba o rechaza un recurso que propusiste.",
  },
  RESULTADO_TESTIMONIO: {
    titulo: "Resultado de mi testimonio",
    descripcion: "Cuando se aprueba o rechaza un testimonio que enviaste.",
  },
  NUEVO_ADMIN_PENDIENTE: {
    titulo: "Nueva cuenta administradora",
    descripcion: "Cuando un centro solicita aprobación para comenzar a operar.",
  },
  ESTADO_CUENTA_ADMIN: {
    titulo: "Estado de cuenta administradora",
    descripcion: "Cuando una solicitud de cuenta administradora es aprobada o rechazada.",
  },
};

const TIPOS_POR_ROL: Record<RolType, readonly TipoNotificacionType[]> = {
  [Rol.COLABORADOR]: [
    TipoNotificacion.NUEVA_ACTIVIDAD,
    TipoNotificacion.META_CUMPLIDA,
    TipoNotificacion.ESTADO_APORTE,
    TipoNotificacion.AFILIACION_REMOVIDA,
    TipoNotificacion.RESULTADO_TESTIMONIO,
  ],
  [Rol.ADMIN]: [
    TipoNotificacion.META_CUMPLIDA,
    TipoNotificacion.NUEVO_APORTE,
    TipoNotificacion.NUEVA_AFILIACION,
    TipoNotificacion.NUEVA_SOLICITUD_ZONA,
    TipoNotificacion.ESTADO_CUENTA_ADMIN,
  ],
  [Rol.SOLICITANTE]: [
    TipoNotificacion.ESTADO_SOLICITUD,
    TipoNotificacion.ACTUALIZACION_AUDITORIA,
    TipoNotificacion.RESULTADO_PROPUESTA_RECURSO,
    TipoNotificacion.RESULTADO_TESTIMONIO,
  ],
  [Rol.AUDITOR]: [TipoNotificacion.NUEVA_SOLICITUD_AUDITABLE],
  [Rol.SUPERADMIN]: [TipoNotificacion.NUEVO_ADMIN_PENDIENTE],
};

export function tiposNotificacionPorRol(
  rol: RolType,
): readonly TipoNotificacionType[] {
  return TIPOS_POR_ROL[rol];
}

export function tipoAplicaAlRol(
  tipo: TipoNotificacionType,
  rol: RolType,
): boolean {
  return TIPOS_POR_ROL[rol].includes(tipo);
}

export function preferenciasParaRol(
  rol: RolType,
  guardadas: readonly PreferenciaNotificacion[],
): PreferenciaVista[] {
  const porTipo = new Map(guardadas.map((item) => [item.tipo, item]));
  return tiposNotificacionPorRol(rol).map((tipo) => ({
    tipo,
    ...DESCRIPCIONES[tipo],
    emailActivo: porTipo.get(tipo)?.emailActivo ?? true,
    whatsappActivo: porTipo.get(tipo)?.whatsappActivo ?? true,
  }));
}

export function canalActivo(
  preferencia: PreferenciaNotificacion | undefined,
  canal: CanalExterno,
): boolean {
  if (!preferencia) return true;
  return canal === "EMAIL"
    ? preferencia.emailActivo
    : preferencia.whatsappActivo;
}
