import type { EstadoActividad } from "./EstadoActividad";
import type { TipoActividad } from "./TipoActividad";
import type {
  Actividad,
  CambiosActividad,
  NuevaActividad,
  NuevaMeta,
} from "./Actividad";
import type {
  ArchivoActividad,
  NuevoArchivoActividad,
} from "./ArchivoActividad";

// Filtro de listado de actividades. `texto` busca en los campos visibles principales,
// `estado` acota por etapa del ciclo de vida, `tipo` por tipo de actividad (feature
// 018) y `adminId` por dueño (feature 022); son combinables. El listado de gestión
// del ADMIN siempre pasa `adminId`.
export type FiltroActividades = {
  /** Coincidencia parcial, sin distinguir mayúsculas, en título, descripción o destino. */
  texto?: string;
  estado?: EstadoActividad;
  tipo?: TipoActividad;
  adminId?: string;
  /** Actividades vinculadas al centro indicado (relación muchos-a-muchos). */
  puntoAcopioId?: string;
  /** Límites inclusivos sobre la fecha operativa de la actividad, en UTC. */
  fechaDesde?: Date;
  fechaHasta?: Date;
};

// Contrato de persistencia de actividades. La implementación concreta (Prisma) vive
// en la capa de infraestructura; el dominio solo define la interfaz. Las lecturas
// devuelven la Actividad con sus `metas` (y los datos del recurso para el detalle).
export interface ActividadRepository {
  crear(datos: NuevaActividad): Promise<Actividad>;
  listar(filtro?: FiltroActividades): Promise<Actividad[]>;
  buscarPorId(id: string): Promise<Actividad | null>;
  actualizarCabecera(id: string, cambios: CambiosActividad): Promise<Actividad>;
  // Añade la meta o, si ya existe una para ese recurso, actualiza su objetivo
  // (única por [actividad, recurso]).
  upsertMeta(actividadId: string, meta: NuevaMeta): Promise<Actividad>;
  quitarMeta(actividadId: string, recursoId: string): Promise<Actividad>;
  cambiarEstado(id: string, estado: EstadoActividad): Promise<Actividad>;
  eliminar(id: string): Promise<void>;

  // ── Archivos (feature 033) ──
  crearArchivo(nuevo: NuevoArchivoActividad): Promise<ArchivoActividad>;
  eliminarArchivo(archivoId: string): Promise<void>;
  buscarArchivoPorId(
    archivoId: string,
  ): Promise<{ archivo: ArchivoActividad; actividadId: string } | null>;
  contarAdjuntos(actividadId: string): Promise<number>;
  obtenerArchivoPrincipal(
    actividadId: string,
  ): Promise<ArchivoActividad | null>;
}
