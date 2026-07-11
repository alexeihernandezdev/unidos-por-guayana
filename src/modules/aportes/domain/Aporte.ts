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

export type MedioDeAporte = {
  id: string;
  tipo: string;
  titular: string;
};

export type Aporte = {
  id: string;
  actividadId: string | null;
  recursoId: string;
  colaboradorId: string | null;
  cantidad: number;
  moneda: string | null;
  estado: EstadoAporte;
  nota: string | null;
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

// Datos para dar de alta un aporte. `estado` no se pide: nace en `COMPROMETIDO`.
export type NuevoAporte = {
  actividadId: string | null;
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

// Progreso de una meta concreta de una Actividad. `recibido` = suma de aportes en
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
