import type { EstadoAyuda } from "./EstadoAyuda";
import type { TipoActividad } from "./TipoActividad";
import type { Ayuda, CambiosAyuda, NuevaAyuda, NuevaMeta } from "./Ayuda";

// Filtro de listado de ayudas. `estado` acota por etapa del ciclo de vida,
// `tipo` por tipo de actividad (feature 018) y `adminId` por dueño (feature 022);
// son combinables. El listado de gestión del ADMIN siempre pasa `adminId`.
export type FiltroAyudas = {
  estado?: EstadoAyuda;
  tipo?: TipoActividad;
  adminId?: string;
};

// Contrato de persistencia de ayudas. La implementación concreta (Prisma) vive en
// la capa de infraestructura; el dominio solo define la interfaz. Las lecturas
// devuelven la Ayuda con sus `metas` (y los datos del recurso para el detalle).
export interface AyudaRepository {
  crear(datos: NuevaAyuda): Promise<Ayuda>;
  listar(filtro?: FiltroAyudas): Promise<Ayuda[]>;
  buscarPorId(id: string): Promise<Ayuda | null>;
  actualizarCabecera(id: string, cambios: CambiosAyuda): Promise<Ayuda>;
  // Añade la meta o, si ya existe una para ese recurso, actualiza su objetivo
  // (única por [ayuda, recurso]).
  upsertMeta(ayudaId: string, meta: NuevaMeta): Promise<Ayuda>;
  quitarMeta(ayudaId: string, recursoId: string): Promise<Ayuda>;
  cambiarEstado(id: string, estado: EstadoAyuda): Promise<Ayuda>;
  eliminar(id: string): Promise<void>;
}
