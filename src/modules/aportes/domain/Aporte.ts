import type { EstadoAporte } from "./EstadoAporte";

// Entidad de dominio del Aporte, pura: `cantidad` es un `number` (la
// infraestructura convierte el `Decimal` de Prisma en el límite, ver decisión de
// la feature 005) y las fechas son `Date` en UTC.

// Datos del recurso y del colaborador que se incluyen al leer un aporte con
// detalle, para que la UI muestre nombre/unidad sin acoplar el dominio de aportes
// al modelo completo de `Recurso` o `Usuario`.
export type RecursoDeAporte = {
  id: string;
  nombre: string;
  unidad: string;
};

export type ColaboradorDeAporte = {
  id: string;
  nombre: string;
  email: string;
};

// Datos del medio de donación por el que entró un ingreso monetario externo
// (feature 014), incluidos al leer un aporte con detalle para las tablas de admin.
export type MedioDeAporte = {
  id: string;
  tipo: string;
  titular: string;
};

export type Aporte = {
  id: string;
  // Opcional desde la feature 014: un ingreso monetario externo de "caja general"
  // no se ata a ninguna Ayuda. Los aportes de colaborador (006) siempre la llevan.
  ayudaId: string | null;
  recursoId: string;
  // Opcional desde la feature 014: un ingreso monetario externo imputado por el
  // ADMIN puede no tener colaborador (donación anónima o de un tercero).
  colaboradorId: string | null;
  cantidad: number;
  // Moneda del aporte (feature 014). Obligatoria cuando el recurso es `MONETARIO`;
  // `null` para el resto de categorías.
  moneda: string | null;
  estado: EstadoAporte;
  nota: string | null;
  // Auditoría del aporte externo (feature 014): ADMIN que lo imputó, medio de pago
  // y referencia/nota del ingreso. Nulos en los aportes ordinarios de colaborador.
  registradoPorId: string | null;
  medioDonacionId: string | null;
  referencia: string | null;
  recibidoEn: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Poblado en lecturas con detalle; puede venir `null` en listados ligeros.
  recurso: RecursoDeAporte | null;
  colaborador: ColaboradorDeAporte | null;
  medio: MedioDeAporte | null;
};

// Datos para dar de alta un aporte. En el flujo del colaborador (006) `estado` no
// se pasa: nace en `COMPROMETIDO`. En el flujo de ingreso externo del ADMIN (014)
// se crea directamente en `RECIBIDO` con `recibidoEn`, sin colaborador y con los
// campos de auditoría/medio/moneda/referencia.
export type NuevoAporte = {
  ayudaId: string | null;
  recursoId: string;
  colaboradorId: string | null;
  cantidad: number;
  nota: string | null;
  moneda?: string | null;
  estado?: EstadoAporte;
  registradoPorId?: string | null;
  medioDonacionId?: string | null;
  referencia?: string | null;
  recibidoEn?: Date | null;
};

// Progreso de una meta concreta de una Ayuda. `recibido` = suma de aportes en
// estado `RECIBIDO`; `prometido` = suma en `COMPROMETIDO`. Solo `recibido` cuenta
// para el porcentaje (feature 006, decisión "Solo cuentan aportes RECIBIDO").
export type ProgresoMeta = {
  recibido: number;
  prometido: number;
  porcentaje: number;
};

// Progreso de una meta enriquecido con datos del recurso, para las vistas.
export type ProgresoMetaDetalle = ProgresoMeta & {
  recursoId: string;
  nombre: string;
  unidad: string;
  objetivo: number;
};
