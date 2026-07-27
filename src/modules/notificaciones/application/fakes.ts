import type {
  CanalWhatsApp,
  EnvioWhatsApp,
} from "@/modules/notificaciones/domain/CanalWhatsApp";
import type { LectorContacto } from "@/modules/notificaciones/domain/LectorContacto";
import type {
  ContactoDestinatario,
  Notificacion,
  NuevaNotificacion,
} from "@/modules/notificaciones/domain/Notificacion";
import type {
  FiltroNotificaciones,
  NotificacionRepository,
} from "@/modules/notificaciones/domain/NotificacionRepository";
import type {
  CanalExterno,
  PreferenciaNotificacion,
  PreferenciaNotificacionRepository,
} from "@/modules/notificaciones/domain";
import type {
  CanalEmail,
  EnvioEmail,
} from "@/modules/notificaciones/domain/CanalEmail";
import type { TipoNotificacion } from "@/modules/notificaciones/domain/TipoNotificacion";
import { Rol } from "@/modules/usuarios/domain/Rol";

// Dobles en memoria para los tests de la capa de aplicación (feature 012).

export class FakeNotificacionRepository implements NotificacionRepository {
  items: Notificacion[] = [];
  private secuencia = 0;

  async crearMuchas(nuevas: readonly NuevaNotificacion[]): Promise<void> {
    for (const nueva of nuevas) {
      // Respeta el @@unique([usuarioId, claveDedupe]): ignora duplicados.
      const existe = this.items.some(
        (n) =>
          n.usuarioId === nueva.usuarioId &&
          n.claveDedupe === nueva.claveDedupe,
      );
      if (existe) continue;
      this.secuencia += 1;
      this.items.push({
        id: `notif-${this.secuencia}`,
        usuarioId: nueva.usuarioId,
        tipo: nueva.tipo,
        mensaje: nueva.mensaje,
        referenciaTipo: nueva.referenciaTipo,
        referenciaId: nueva.referenciaId,
        leida: false,
        claveDedupe: nueva.claveDedupe,
        createdAt: new Date(this.secuencia * 1000),
      });
    }
  }

  async usuariosConClave(claveDedupe: string): Promise<string[]> {
    return this.items
      .filter((n) => n.claveDedupe === claveDedupe)
      .map((n) => n.usuarioId);
  }

  async listarPorUsuario(
    usuarioId: string,
    filtro?: FiltroNotificaciones,
  ): Promise<Notificacion[]> {
    let lista = this.items
      .filter((n) => n.usuarioId === usuarioId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (filtro?.soloNoLeidas) lista = lista.filter((n) => !n.leida);
    if (filtro?.limite != null) lista = lista.slice(0, filtro.limite);
    return lista;
  }

  async contarNoLeidas(usuarioId: string): Promise<number> {
    return this.items.filter((n) => n.usuarioId === usuarioId && !n.leida)
      .length;
  }

  async marcarLeida(id: string, usuarioId: string): Promise<boolean> {
    const notif = this.items.find(
      (n) => n.id === id && n.usuarioId === usuarioId,
    );
    if (!notif) return false;
    notif.leida = true;
    return true;
  }

  async marcarTodasLeidas(usuarioId: string): Promise<void> {
    for (const n of this.items) {
      if (n.usuarioId === usuarioId) n.leida = true;
    }
  }
}

export class FakeCanalWhatsApp implements CanalWhatsApp {
  enviados: EnvioWhatsApp[] = [];
  fallar = false;

  async enviar(mensaje: EnvioWhatsApp): Promise<void> {
    if (this.fallar) throw new Error("WhatsApp caído");
    this.enviados.push(mensaje);
  }
}

export class FakeLectorContacto implements LectorContacto {
  private readonly contactos: ContactoDestinatario[];

  constructor(
    contactos: Array<
      Pick<ContactoDestinatario, "usuarioId" | "telefono" | "telefonoEsWhatsApp"> &
        Partial<ContactoDestinatario>
    >,
  ) {
    this.contactos = contactos.map((contacto) => ({
      nombre: "Persona",
      email: `${contacto.usuarioId}@example.com`,
      rol: Rol.COLABORADOR,
      ...contacto,
    }));
  }

  async contactoDe(
    usuarioIds: readonly string[],
  ): Promise<ContactoDestinatario[]> {
    return this.contactos.filter((c) => usuarioIds.includes(c.usuarioId));
  }
}

export class FakeCanalEmail implements CanalEmail {
  enviados: EnvioEmail[] = [];
  pruebas: Array<{ email: string; nombre: string }> = [];
  fallar = false;
  activo = true;

  disponible(): boolean {
    return this.activo;
  }

  async enviar(envio: EnvioEmail): Promise<void> {
    if (this.fallar) throw new Error("SMTP caído");
    if (this.activo) this.enviados.push(envio);
  }

  async enviarPrueba(destinatario: {
    email: string;
    nombre: string;
  }): Promise<void> {
    if (this.fallar) throw new Error("SMTP caído");
    this.pruebas.push(destinatario);
  }
}

export class FakePreferenciaNotificacionRepository
  implements PreferenciaNotificacionRepository
{
  items: PreferenciaNotificacion[] = [];

  async listarPorUsuario(usuarioId: string): Promise<PreferenciaNotificacion[]> {
    return this.items.filter((item) => item.usuarioId === usuarioId);
  }

  async listarPorUsuarios(
    usuarioIds: readonly string[],
  ): Promise<PreferenciaNotificacion[]> {
    return this.items.filter((item) => usuarioIds.includes(item.usuarioId));
  }

  async guardar(
    usuarioId: string,
    tipo: TipoNotificacion,
    canal: CanalExterno,
    activo: boolean,
  ): Promise<void> {
    let item = this.items.find(
      (actual) => actual.usuarioId === usuarioId && actual.tipo === tipo,
    );
    if (!item) {
      item = {
        usuarioId,
        tipo,
        emailActivo: true,
        whatsappActivo: true,
      };
      this.items.push(item);
    }
    if (canal === "EMAIL") item.emailActivo = activo;
    else item.whatsappActivo = activo;
  }
}
