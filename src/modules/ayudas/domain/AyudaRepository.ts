import type { EstadoAyuda } from "./EstadoAyuda";
import type { TipoActividad } from "./TipoActividad";
import type { Ayuda, CambiosAyuda, NuevaAyuda, NuevaMeta } from "./Ayuda";
import type {
  NuevoEventoSeguimiento,
  SeguimientoEvento,
} from "./SeguimientoEvento";

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
  // Cambia el estado de la Ayuda **e** inserta el evento de seguimiento de la
  // transición en la misma transacción (feature 010): nunca un estado sin su
  // evento ni un evento sin su cambio. Devuelve la Ayuda ya actualizada.
  avanzarConSeguimiento(
    id: string,
    nuevoEstado: EstadoAyuda,
    evento: NuevoEventoSeguimiento,
  ): Promise<Ayuda>;
  // Registra un evento suelto (p. ej. el de creación, `estadoAnterior = null`).
  registrarEvento(
    ayudaId: string,
    evento: NuevoEventoSeguimiento,
  ): Promise<SeguimientoEvento>;
  // Historial de una Ayuda ordenado por `ocurridoEn` ascendente (cronológico).
  listarSeguimiento(ayudaId: string): Promise<SeguimientoEvento[]>;
  eliminar(id: string): Promise<void>;
}
