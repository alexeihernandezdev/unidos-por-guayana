import type {
  Actividad,
  CambiosActividad,
  MetaRecurso,
  NuevaActividad,
  NuevaMeta,
} from "@/modules/actividades/domain/Actividad";
import type { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { EstadoActividad as Estados } from "@/modules/actividades/domain/EstadoActividad";
import type {
  ArchivoActividad,
  NuevoArchivoActividad,
} from "@/modules/actividades/domain/ArchivoActividad";
import type {
  ActividadRepository,
  FiltroActividades,
} from "@/modules/actividades/domain/ActividadRepository";
import { ActividadNoEncontradaError } from "./errors";

// Doble en memoria para los tests de casos de uso. No toca la base ni Prisma. Las
// metas se guardan sin datos del recurso (`recurso: null`), suficiente para probar
// la lógica de aplicación; el detalle enriquecido lo resuelve la infraestructura.
export class InMemoryActividadRepository implements ActividadRepository {
  private readonly porId = new Map<string, Actividad>();
  private readonly archivosPorId = new Map<
    string,
    ArchivoActividad & { actividadId: string }
  >();
  private secuencia = 0;
  private metaSecuencia = 0;
  private archivoSecuencia = 0;

  private nuevaMeta(meta: NuevaMeta): MetaRecurso {
    return {
      id: `meta-${++this.metaSecuencia}`,
      recursoId: meta.recursoId,
      cantidadObjetivo: meta.cantidadObjetivo,
      recurso: null,
      atenciones: [],
    };
  }

  async crear(datos: NuevaActividad): Promise<Actividad> {
    const ahora = new Date();
    const ayuda: Actividad = {
      id: `actividad-${++this.secuencia}`,
      adminId: datos.adminId,
      titulo: datos.titulo,
      sectorDestino: datos.sectorDestino,
      fecha: datos.fecha,
      horaFin: datos.horaFin,
      estado: Estados.RECOLECTANDO,
      tipo: datos.tipo,
      descripcion: datos.descripcion,
      puntosAcopio: datos.puntosAcopioIds.map((id) => ({
        id,
        nombre: "",
        referencia: "",
        horarios: "",
      })),
      metas: datos.metas.map((m) => this.nuevaMeta(m)),
      archivos: [],
      createdAt: ahora,
      updatedAt: ahora,
    };
    this.porId.set(ayuda.id, ayuda);
    return this.clonar(ayuda);
  }

  async listar(filtro?: FiltroActividades): Promise<Actividad[]> {
    let actividades = [...this.porId.values()];
    if (filtro?.texto) {
      const texto = filtro.texto.toLocaleLowerCase("es-VE");
      actividades = actividades.filter((a) =>
        [a.titulo, a.descripcion ?? "", a.sectorDestino].some((campo) =>
          campo.toLocaleLowerCase("es-VE").includes(texto),
        ),
      );
    }
    if (filtro?.estado) {
      actividades = actividades.filter((a) => a.estado === filtro.estado);
    }
    if (filtro?.tipo) {
      actividades = actividades.filter((a) => a.tipo === filtro.tipo);
    }
    if (filtro?.adminId) {
      actividades = actividades.filter((a) => a.adminId === filtro.adminId);
    }
    if (filtro?.puntoAcopioId) {
      actividades = actividades.filter((a) =>
        a.puntosAcopio.some((p) => p.id === filtro.puntoAcopioId),
      );
    }
    if (filtro?.fechaDesde) {
      actividades = actividades.filter((a) => a.fecha >= filtro.fechaDesde!);
    }
    if (filtro?.fechaHasta) {
      actividades = actividades.filter((a) => a.fecha <= filtro.fechaHasta!);
    }
    return actividades.map((a) => this.clonar(a));
  }

  async buscarPorId(id: string): Promise<Actividad | null> {
    const ayuda = this.porId.get(id);
    return ayuda ? this.clonar(ayuda) : null;
  }

  async actualizarCabecera(id: string, cambios: CambiosActividad): Promise<Actividad> {
    const actual = this.requerir(id);
    // `puntosAcopioIds` (si viene) reemplaza el conjunto; el resto son escalares.
    const { puntosAcopioIds, ...escalares } = cambios;
    const actualizado: Actividad = {
      ...actual,
      ...escalares,
      ...(puntosAcopioIds !== undefined
        ? {
            puntosAcopio: puntosAcopioIds.map((idPunto) => ({
              id: idPunto,
              nombre: "",
              referencia: "",
              horarios: "",
            })),
          }
        : {}),
      updatedAt: new Date(),
    };
    this.porId.set(id, actualizado);
    return this.clonar(actualizado);
  }

  async upsertMeta(actividadId: string, meta: NuevaMeta): Promise<Actividad> {
    const actual = this.requerir(actividadId);
    const existente = actual.metas.find((m) => m.recursoId === meta.recursoId);
    const metas = existente
      ? actual.metas.map((m) =>
          m.recursoId === meta.recursoId
            ? { ...m, cantidadObjetivo: meta.cantidadObjetivo }
            : m,
        )
      : [...actual.metas, this.nuevaMeta(meta)];
    const actualizado: Actividad = { ...actual, metas, updatedAt: new Date() };
    this.porId.set(actividadId, actualizado);
    return this.clonar(actualizado);
  }

  async quitarMeta(actividadId: string, recursoId: string): Promise<Actividad> {
    const actual = this.requerir(actividadId);
    const actualizado: Actividad = {
      ...actual,
      metas: actual.metas.filter((m) => m.recursoId !== recursoId),
      updatedAt: new Date(),
    };
    this.porId.set(actividadId, actualizado);
    return this.clonar(actualizado);
  }

  async cambiarEstado(id: string, estado: EstadoActividad): Promise<Actividad> {
    const actual = this.requerir(id);
    const actualizado: Actividad = { ...actual, estado, updatedAt: new Date() };
    this.porId.set(id, actualizado);
    return this.clonar(actualizado);
  }

  async eliminar(id: string): Promise<void> {
    this.requerir(id);
    this.porId.delete(id);
  }

  async crearArchivo(nuevo: NuevoArchivoActividad): Promise<ArchivoActividad> {
    const archivo: ArchivoActividad & { actividadId: string } = {
      id: `archivo-${++this.archivoSecuencia}`,
      actividadId: nuevo.actividadId,
      tipo: nuevo.tipo,
      path: nuevo.path,
      nombreOriginal: nuevo.nombreOriginal,
      contentType: nuevo.contentType,
      tamanoBytes: nuevo.tamanoBytes,
      createdAt: new Date(),
    };
    this.archivosPorId.set(archivo.id, archivo);
    const { actividadId, ...sinActividad } = archivo;
    void actividadId;
    return { ...sinActividad };
  }

  async eliminarArchivo(archivoId: string): Promise<void> {
    this.archivosPorId.delete(archivoId);
  }

  async buscarArchivoPorId(
    archivoId: string,
  ): Promise<{ archivo: ArchivoActividad; actividadId: string } | null> {
    const fila = this.archivosPorId.get(archivoId);
    if (!fila) return null;
    const { actividadId, ...archivo } = fila;
    return { archivo: { ...archivo }, actividadId };
  }

  async contarAdjuntos(actividadId: string): Promise<number> {
    return [...this.archivosPorId.values()].filter(
      (a) => a.actividadId === actividadId && a.tipo === "ADJUNTO",
    ).length;
  }

  async obtenerArchivoPrincipal(
    actividadId: string,
  ): Promise<ArchivoActividad | null> {
    const fila = [...this.archivosPorId.values()].find(
      (a) => a.actividadId === actividadId && a.tipo === "PRINCIPAL",
    );
    if (!fila) return null;
    const { actividadId: _actividadId, ...archivo } = fila;
    void _actividadId;
    return { ...archivo };
  }

  private requerir(id: string): Actividad {
    const ayuda = this.porId.get(id);
    if (!ayuda) throw new ActividadNoEncontradaError(id);
    return ayuda;
  }

  // Clona para que los tests no muten el estado interno por referencia. Los `archivos`
  // se resuelven desde el almacén de archivos (se mantienen en su propio mapa).
  private clonar(ayuda: Actividad): Actividad {
    return {
      ...ayuda,
      metas: ayuda.metas.map((m) => ({ ...m })),
      puntosAcopio: ayuda.puntosAcopio.map((p) => ({ ...p })),
      archivos: [...this.archivosPorId.values()]
        .filter((a) => a.actividadId === ayuda.id)
        .map(({ actividadId, ...archivo }) => {
          void actividadId;
          return { ...archivo };
        }),
    };
  }
}
