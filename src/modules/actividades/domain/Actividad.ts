import type { ArchivoActividad } from "./ArchivoActividad";
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

// Necesidad de una solicitud que esta meta atiende (feature 030). Se puebla al leer
// con detalle; permite listar dentro de cada meta las solicitudes que cubre y ofrecer
// el desvínculo fino. Se mantiene desacoplado del dominio de solicitudes (campos
// planos, `urgencia` como string) para no acoplar actividades a ese módulo.
export type MetaAtencion = {
  atencionId: string;
  recursoSolicitudId: string;
  solicitudId: string;
  sector: string;
  solicitanteNombre: string;
  cantidadEstimada: number | null;
};

// Meta de recurso: cuánto necesita la actividad de un recurso concreto. `recurso` se
// puebla al leer con detalle (para la UI); puede venir `null` en listados ligeros.
// `atenciones` son las necesidades de solicitud vinculadas a esta meta (feature 030);
// vacío en listados ligeros o si nadie la atiende.
export type MetaRecurso = {
  id: string;
  recursoId: string;
  cantidadObjetivo: number;
  recurso: RecursoDeMeta | null;
  atenciones: MetaAtencion[];
};

// Punto de acopio asignado a una actividad (feature 026). Datos mínimos para el
// bloque "Dónde entregar" del detalle; el modelo completo del punto vive en el
// módulo `acopio` (feature 011). Se enriquece al leer con detalle.
export type PuntoAcopioDeActividad = {
  id: string;
  nombre: string;
  referencia: string;
  horarios: string;
};

// Actividad: la entidad central (antes `Ayuda`). Nace en `RECOLECTANDO` y avanza por
// la máquina de estados de su `tipo` (ver `maquinaEstados.ts`). `adminId` es el dueño
// (ADMIN que la creó); inmutable tras el alta (feature 022). `horaFin` es opcional
// (feature 024). `puntosAcopio` son los centros asignados (0..N, feature 026).
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
  puntosAcopio: PuntoAcopioDeActividad[];
  metas: MetaRecurso[];
  // Imagen principal y documentos (feature 033). Vacío en listados ligeros; poblado al
  // leer con detalle o cuando la lista necesita la portada.
  archivos: ArchivoActividad[];
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
// dueño (feature 022). `horaFin` es opcional (feature 024). `puntosAcopioIds` son los
// ids de los centros asignados (0..N, feature 026; el caso de uso los valida).
export type NuevaActividad = {
  adminId: string;
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  horaFin: Date | null;
  tipo: TipoActividad;
  descripcion: string | null;
  puntosAcopioIds: string[];
  metas: NuevaMeta[];
};

// Cambios aplicables a la cabecera de una Actividad (solo en `RECOLECTANDO`). Todos
// opcionales: se actualiza solo lo que venga. El `estado` se mueve por la máquina de
// estados (caso de uso `avanzarEstado`), no por aquí.
// `puntosAcopioIds`, si viene, reemplaza el conjunto completo de centros asignados
// (feature 026); ausente = no se tocan.
export type CambiosActividad = Partial<{
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  horaFin: Date | null;
  descripcion: string | null;
  puntosAcopioIds: string[];
}>;
