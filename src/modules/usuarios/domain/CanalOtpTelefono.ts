export type MensajeOtpTelefono = {
  telefonoE164: string;
  codigo: string;
};

export interface CanalOtpTelefono {
  enviar(mensaje: MensajeOtpTelefono): Promise<void>;
}

