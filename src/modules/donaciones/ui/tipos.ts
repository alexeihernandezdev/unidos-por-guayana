import { TipoMedioDonacion } from "@/modules/donaciones/domain/TipoMedioDonacion";

// Etiquetas de presentación para cada tipo de medio (el dominio guarda el valor en
// mayúsculas; aquí se traduce a un texto legible en español). Sin em-dash ni
// en-dash en los copys visibles (constitution/tech-stack.md).
export const TIPO_MEDIO_LABEL: Record<TipoMedioDonacion, string> = {
  [TipoMedioDonacion.CUENTA_BANCARIA]: "Cuenta bancaria",
  [TipoMedioDonacion.PAGO_MOVIL]: "Pago Móvil",
  [TipoMedioDonacion.PAYPAL]: "PayPal",
  [TipoMedioDonacion.ZELLE]: "Zelle",
  [TipoMedioDonacion.BINANCE]: "Binance",
  [TipoMedioDonacion.EFECTIVO]: "Efectivo",
  [TipoMedioDonacion.OTRO]: "Otro",
};
