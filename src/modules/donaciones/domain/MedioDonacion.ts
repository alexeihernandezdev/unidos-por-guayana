import type { TipoMedioDonacion } from "./TipoMedioDonacion";

// Entidad de dominio del MedioDonacion (feature 014): un canal externo por el que
// el proyecto invita a donar dinero (cuenta bancaria, Pago Móvil, PayPal, Zelle,
// Binance, efectivo…). Es configuración administrable, de solo lectura para el
// público. `datos` es la instrucción legible (número de cuenta, correo, alias…);
// `moneda` es un código acotado (ver `Moneda`). No se borra: se desactiva con
// `activo = false` para conservar la trazabilidad de los ingresos asociados.
export type MedioDonacion = {
  id: string;
  tipo: TipoMedioDonacion;
  titular: string;
  moneda: string;
  datos: string;
  nota: string | null;
  orden: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Datos para dar de alta un medio. `activo` no se pide: nace en `true` (default del
// schema). `orden` es opcional (default 0).
export type NuevoMedioDonacion = {
  tipo: TipoMedioDonacion;
  titular: string;
  moneda: string;
  datos: string;
  nota: string | null;
  orden?: number;
};

// Cambios aplicables al editar un medio. Todos opcionales: se actualiza solo lo que
// venga. `activo` se alterna por activar/desactivar (nunca se borra).
export type CambiosMedioDonacion = Partial<{
  tipo: TipoMedioDonacion;
  titular: string;
  moneda: string;
  datos: string;
  nota: string | null;
  orden: number;
  activo: boolean;
}>;
