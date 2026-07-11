import type { EstadoAyuda } from "./EstadoAyuda";
import type { TipoActividad } from "./TipoActividad";

// Entidades de dominio de la Ayuda / Envío (feature 005). Puras: `cantidadObjetivo`
// es un `number` (la infraestructura convierte el `Decimal` de Prisma en el límite),
// y `fecha` un `Date` en UTC (la UI la interpreta/formatea con Luxon).

// Datos del recurso asociados a una meta, para mostrar nombre/unidad en el detalle
// sin acoplar el dominio de ayudas al modelo completo de `Recurso`.
export type RecursoDeMeta = {
  id: string;
  nombre: string;
  unidad: string;
};

// Meta de recurso: cuánto necesita el envío de un recurso concreto. `recurso` se
// puebla al leer con detalle (para la UI); puede venir `null` en listados ligeros.
export type MetaRecurso = {
  id: string;
  recursoId: string;
  cantidadObjetivo: number;
  recurso: RecursoDeMeta | null;
};

// Ayuda / Envío: la entidad central. Nace en `RECOLECTANDO` y avanza por la máquina
// de estados (ver `maquinaEstados.ts`). `adminId` es el dueño (ADMIN que la creó);
// inmutable tras el alta (feature 022).
export type Ayuda = {
  id: string;
  adminId: string;
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  estado: EstadoAyuda;
  tipo: TipoActividad;
  descripcion: string | null;
  metas: MetaRecurso[];
  createdAt: Date;
  updatedAt: Date;
};

// Meta a crear/actualizar: enlaza un recurso con su objetivo.
export type NuevaMeta = {
  recursoId: string;
  cantidadObjetivo: number;
};

// Datos para dar de alta una Ayuda con sus metas iniciales. `estado` no se pide:
// nace en `RECOLECTANDO` por defecto (ver schema). `tipo` sí se pide: lo elige
// el ADMIN al iniciar el alta (feature 018) y es inmutable después. `adminId` es
// el dueño (feature 022); no entra en `CambiosAyuda`.
export type NuevaAyuda = {
  adminId: string;
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  tipo: TipoActividad;
  descripcion: string | null;
  metas: NuevaMeta[];
};

// Cambios aplicables a la cabecera de una Ayuda (solo en `RECOLECTANDO`). Todos
// opcionales: se actualiza solo lo que venga. El `estado` se mueve por la máquina de
// estados (caso de uso `avanzarEstado`), no por aquí.
export type CambiosAyuda = Partial<{
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  descripcion: string | null;
}>;
