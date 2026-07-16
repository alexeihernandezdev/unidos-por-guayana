import { beforeEach, describe, expect, it } from "vitest";
import { crearActividad } from "@/modules/actividades/application/crearActividad";
import { avanzarEstado } from "@/modules/actividades/application/avanzarEstado";
import { InMemoryActividadRepository } from "@/modules/actividades/application/fakes";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import { Rol } from "@/modules/usuarios/domain/Rol";
import type { AporteDeps } from "./deps";
import {
  ActividadNoAceptaAportesError,
  DatosAporteInvalidosError,
  NoAutorizadoError,
  RecursoFueraDeMetasError,
} from "./errors";
import { InMemoryAporteRepository } from "./fakes";
import { registrarAporteDirecto } from "./registrarAporteDirecto";

const ADMIN = { id: "admin-1", rol: Rol.ADMIN } as const;
const OTRO_ADMIN = { id: "admin-2", rol: Rol.ADMIN } as const;
const COL = { id: "col-1", rol: Rol.COLABORADOR } as const;

async function armar() {
  const recursos = new InMemoryRecursoRepository();
  const agua = await recursos.crear({
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const arroz = await recursos.crear({
    nombre: "Arroz",
    unidad: "kg",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const actividades = new InMemoryActividadRepository();
  const deps: AporteDeps = {
    aportes: new InMemoryAporteRepository(),
    actividades,
    recursos,
  };
  const actividad = await crearActividad(deps, {
    adminId: ADMIN.id,
    titulo: "Envío a Upata",
    sectorDestino: "Upata",
    fecha: new Date("2026-07-01T00:00:00Z"),
    tipo: "ENVIO",
    metas: [{ recursoId: agua.id, cantidadObjetivo: 100 }],
  });
  return { deps, recursos, actividad, aguaId: agua.id, arrozId: arroz.id };
}

describe("registrarAporteDirecto", () => {
  let ctx: Awaited<ReturnType<typeof armar>>;
  beforeEach(async () => {
    ctx = await armar();
  });

  it("crea la donación RECIBIDA, anónima, sin colaborador e imputada al ADMIN", async () => {
    const { deps, actividad, aguaId } = ctx;
    const aporte = await registrarAporteDirecto(
      deps,
      { actividadId: actividad.id, recursoId: aguaId, cantidad: 30 },
      ADMIN,
    );
    expect(aporte.estado).toBe(EstadoAporte.RECIBIDO);
    expect(aporte.esAnonimo).toBe(true);
    expect(aporte.colaboradorId).toBeNull();
    expect(aporte.registradoPorId).toBe(ADMIN.id);
    expect(aporte.cantidad).toBe(30);
  });

  it("suma al progreso de la meta", async () => {
    const { deps, actividad, aguaId } = ctx;
    await registrarAporteDirecto(
      deps,
      { actividadId: actividad.id, recursoId: aguaId, cantidad: 40 },
      ADMIN,
    );
    const progreso = await deps.aportes.progresoPorActividad(actividad.id);
    expect(progreso.find((p) => p.recursoId === aguaId)?.recibido).toBe(40);
  });

  it("normaliza la nota", async () => {
    const { deps, actividad, aguaId } = ctx;
    const aporte = await registrarAporteDirecto(
      deps,
      {
        actividadId: actividad.id,
        recursoId: aguaId,
        cantidad: 10,
        nota: "  entregado por vecino  ",
      },
      ADMIN,
    );
    expect(aporte.nota).toBe("entregado por vecino");
  });

  it("rechaza a un actor que no es ADMIN", async () => {
    const { deps, actividad, aguaId } = ctx;
    await expect(
      registrarAporteDirecto(
        deps,
        { actividadId: actividad.id, recursoId: aguaId, cantidad: 10 },
        COL,
      ),
    ).rejects.toBeInstanceOf(NoAutorizadoError);
  });

  it("rechaza a un ADMIN que no es dueño de la actividad", async () => {
    const { deps, actividad, aguaId } = ctx;
    await expect(
      registrarAporteDirecto(
        deps,
        { actividadId: actividad.id, recursoId: aguaId, cantidad: 10 },
        OTRO_ADMIN,
      ),
    ).rejects.toBeInstanceOf(NoAutorizadoError);
  });

  it("rechaza cantidad no positiva", async () => {
    const { deps, actividad, aguaId } = ctx;
    await expect(
      registrarAporteDirecto(
        deps,
        { actividadId: actividad.id, recursoId: aguaId, cantidad: 0 },
        ADMIN,
      ),
    ).rejects.toBeInstanceOf(DatosAporteInvalidosError);
  });

  it("rechaza un recurso fuera de las metas", async () => {
    const { deps, actividad, arrozId } = ctx;
    await expect(
      registrarAporteDirecto(
        deps,
        { actividadId: actividad.id, recursoId: arrozId, cantidad: 5 },
        ADMIN,
      ),
    ).rejects.toBeInstanceOf(RecursoFueraDeMetasError);
  });

  it("rechaza un recurso archivado", async () => {
    const { deps, actividad, aguaId } = ctx;
    await deps.recursos.actualizar(aguaId, { activo: false });
    await expect(
      registrarAporteDirecto(
        deps,
        { actividadId: actividad.id, recursoId: aguaId, cantidad: 5 },
        ADMIN,
      ),
    ).rejects.toBeInstanceOf(RecursoFueraDeMetasError);
  });

  it("rechaza si la actividad ya no está en RECOLECTANDO", async () => {
    const { deps, actividad, aguaId } = ctx;
    await avanzarEstado(deps, actividad.id, ADMIN.id); // → LISTO
    await expect(
      registrarAporteDirecto(
        deps,
        { actividadId: actividad.id, recursoId: aguaId, cantidad: 5 },
        ADMIN,
      ),
    ).rejects.toBeInstanceOf(ActividadNoAceptaAportesError);
  });

  it("rechaza si la actividad no existe", async () => {
    const { deps, aguaId } = ctx;
    await expect(
      registrarAporteDirecto(
        deps,
        { actividadId: "no-existe", recursoId: aguaId, cantidad: 5 },
        ADMIN,
      ),
    ).rejects.toThrow();
  });
});
