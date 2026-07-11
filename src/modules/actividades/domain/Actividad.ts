import type { EstadoActividad } from "./EstadoActividad";
import type { TipoActividad } from "./TipoActividad";

// Entidades de dominio de la Actividad (features 005 y 024). Puras: `cantidadObjetivo`
// es un `number` (la infraestructura convierte el `Decimal` de Prisma en el límite),
// y las fechas son `Date` en UTC (la UI las interpreta/formatea con Luxon).

// Datos del recurso asociados a una meta, para mostrar nombre/unidad en el detalle
// sin acoplar el dominio de actividades al modelo completo de `Recurso`.
export type RecursoDeMeta = {
  id: string;
  nombre: string;
  unidad: string;
};

// Meta de recurso: cuánto necesita la actividad de un recurso concreto. `recurso` se
// puebla al leer con detalle (para la UI); puede venir `null` en listados ligeros.
export type MetaRecurso = {
  id: string;
  recursoId: string;
  cantidadObjetivo: number;
  recurso: RecursoDeMeta | null;
};

// Actividad: la entidad central (antes `Ayuda`). Nace en `RECOLECTANDO` y avanza por
// la máquina de estados de su `tipo` (ver `maquinaEstados.ts`). `adminId` es el dueño
// (ADMIN que la creó); inmutable tras el alta (feature 022). `horaFin` y
// `puntoAcopioId` son opcionales (feature 024).
export type Actividad = {
  id: string;
  adminId: string;
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  horaFin: Date | null;
  estado: EstadoActividad;
  tipo: TipoActividad;
  descripcion: string | null;
  puntoAcopioId: string | null;
  metas: MetaRecurso[];
  createdAt: Date;
  updatedAt: Date;
};

// Meta a crear/actualizar: enlaza un recurso con su objetivo.
export type NuevaMeta = {
  recursoId: string;
  cantidadObjetivo: number;
};

// Datos para dar de alta una Actividad con sus metas iniciales. `estado` no se pide:
// nace en `RECOLECTANDO` por defecto (ver schema). `tipo` sí se pide: lo elige el
// ADMIN al iniciar el alta (feature 018) y es inmutable después. `adminId` es el
// dueño (feature 022). `horaFin` y `puntoAcopioId` son opcionales (feature 024).
export type NuevaActividad = {
  adminId: string;
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  horaFin: Date | null;
  tipo: TipoActividad;
  descripcion: string | null;
  puntoAcopioId: string | null;
  metas: NuevaMeta[];
};

// Cambios aplicables a la cabecera de una Actividad (solo en `RECOLECTANDO`). Todos
// opcionales: se actualiza solo lo que venga. El `estado` se mueve por la máquina de
// estados (caso de uso `avanzarEstado`), no por aquí.
export type CambiosActividad = Partial<{
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  horaFin: Date | null;
  descripcion: string | null;
  puntoAcopioId: string | null;
}>;
