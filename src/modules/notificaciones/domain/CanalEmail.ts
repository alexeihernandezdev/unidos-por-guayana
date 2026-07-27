import type { TipoNotificacion } from "./TipoNotificacion";

export type EnvioEmail = {
  email: string;
  nombre: string;
  tipo: TipoNotificacion;
  asunto: string;
  mensaje: string;
  href: string;
};

export interface CanalEmail {
  disponible(): boolean;
  enviar(envio: EnvioEmail): Promise<void>;
  enviarPrueba(destinatario: { email: string; nombre: string }): Promise<void>;
}
