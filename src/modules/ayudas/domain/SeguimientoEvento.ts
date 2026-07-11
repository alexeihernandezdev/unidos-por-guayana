import type { EstadoAyuda } from "./EstadoAyuda";

// Entidad de dominio del seguimiento del envío (feature 010). Es un hecho histórico
// inmutable: describe una transición de estado ya validada por la máquina de estados.
// Pura: `ocurridoEn` es un `Date` en UTC (la UI la formatea con Luxon a `es-VE`).
//
// - `estadoAnterior = null` marca el evento de creación (origen de la línea de tiempo).
// - `registradoPor` (id del ADMIN) es auditoría interna; la vista pública NUNCA lo
//   expone (ver `SeguimientoEventoPublico`).
export type SeguimientoEvento = {
  id: string;
  ayudaId: string;
  estadoAnterior: EstadoAyuda | null;
  estadoNuevo: EstadoAyuda;
  nota: string | null;
  evidenciaUrl: string | null;
  ocurridoEn: Date;
  registradoPor: string | null;
};

// Datos para registrar un evento nuevo. El repositorio asigna `id` y, si no se
// indica, `ocurridoEn = now()`.
export type NuevoEventoSeguimiento = {
  estadoAnterior: EstadoAyuda | null;
  estadoNuevo: EstadoAyuda;
  nota?: string | null;
  evidenciaUrl?: string | null;
  registradoPor?: string | null;
};

// Vista pública de un evento (feature 009): la misma traza SIN `registradoPor` ni
// ningún dato personal. Es el único tipo que cruza a superficies públicas.
export type SeguimientoEventoPublico = Omit<SeguimientoEvento, "registradoPor">;
