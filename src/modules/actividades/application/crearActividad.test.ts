import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { InMemoryPuntoAcopioRepository } from "@/modules/acopio/application/fakes";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import { crearActividad } from "./crearActividad";
import type { ActividadDeps } from "./deps";
import {
  DatosActividadInvalidosError,
  PuntoAcopioInvalidoError,
  RecursoInvalidoError,
} from "./errors";
import { InMemoryActividadRepository } from "./fakes";

// Crea un punto de acopio de un admin dado en el repo en memoria de acopio.
async function crearPunto(
  puntos: InMemoryPuntoAcopioRepository,
  adminId: string,
  nombre: string,
) {
  return puntos.crear({
    adminId,
    nombre,
    referencia: "ref",
    latitud: "10.5",
    longitud: "-66.9",
    horarios: "L-V 8-16",
    telefono: "04140000000",
    telefonoEsWhatsApp: true,
    correo: null,
    estadoId: "estado-1",
    municipioId: "municipio-1",
  });
}

async function crearDeps() {
  const recursos = new InMemoryRecursoRepository();
  const agua = await recursos.crear({
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const alimentos = await recursos.crear({
    nombre: "Alimentos",
    unidad: "cajas",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const archivado = await recursos.crear({
    nombre: "Camión viejo",
    unidad: "vehículos",
    categoria: CategoriaRecurso.TRANSPORTE,
    descripcion: null,
  });
  await recursos.actualizar(archivado.id, { activo: false });

  const deps: ActividadDeps = { actividades: new InMemoryActividadRepository(), recursos };
  return { deps, agua, alimentos, archivado };
}

describe("crearActividad", () => {
  let ctx: Awaited<ReturnType<typeof crearDeps>>;

  beforeEach(async () => {
    ctx = await crearDeps();
  });

  it("crea una ayuda con sus metas y nace en RECOLECTANDO", async () => {
    const { deps, agua, alimentos } = ctx;

    const ayuda = await crearActividad(deps, {
      adminId: "admin-1",
      titulo: "Envío a Upata",
      sectorDestino: "Upata",
      fecha: new Date("2026-08-01T00:00:00.000Z"),
      tipo: "ENVIO",
      metas: [
        { recursoId: agua.id, cantidadObjetivo: 500 },
        { recursoId: alimentos.id, cantidadObjetivo: 200 },
      ],
    });

    expect(ayuda.id).toBeTruthy();
    expect(ayuda.adminId).toBe("admin-1");
    expect(ayuda.estado).toBe(EstadoActividad.RECOLECTANDO);
    expect(ayuda.metas).toHaveLength(2);
    expect(ayuda.metas.map((m) => m.recursoId)).toContain(agua.id);
  });

  it("normaliza título/sector (trim) y descripción vacía a null", async () => {
    const { deps, agua } = ctx;

    const ayuda = await crearActividad(deps, {
      adminId: "admin-1",
      titulo: "  Envío a Upata  ",
      sectorDestino: "  Upata ",
      fecha: new Date(),
      descripcion: "   ",
      tipo: "ENVIO",
      metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
    });

    expect(ayuda.titulo).toBe("Envío a Upata");
    expect(ayuda.sectorDestino).toBe("Upata");
    expect(ayuda.descripcion).toBeNull();
  });

  it("rechaza un título vacío", async () => {
    const { deps, agua } = ctx;

    await expect(
      crearActividad(deps, {
      adminId: "admin-1",
        titulo: "   ",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "ENVIO",
        metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
      }),
    ).rejects.toBeInstanceOf(DatosActividadInvalidosError);
  });

  it("rechaza un sector vacío", async () => {
    const { deps, agua } = ctx;

    await expect(
      crearActividad(deps, {
      adminId: "admin-1",
        titulo: "Envío",
        sectorDestino: "  ",
        fecha: new Date(),
        tipo: "ENVIO",
        metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
      }),
    ).rejects.toBeInstanceOf(DatosActividadInvalidosError);
  });

  it("exige al menos una meta", async () => {
    const { deps } = ctx;

    await expect(
      crearActividad(deps, {
      adminId: "admin-1",
        titulo: "Envío",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "ENVIO",
        metas: [],
      }),
    ).rejects.toBeInstanceOf(DatosActividadInvalidosError);
  });

  it("rechaza recursos repetidos en las metas", async () => {
    const { deps, agua } = ctx;

    await expect(
      crearActividad(deps, {
      adminId: "admin-1",
        titulo: "Envío",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "ENVIO",
        metas: [
          { recursoId: agua.id, cantidadObjetivo: 10 },
          { recursoId: agua.id, cantidadObjetivo: 20 },
        ],
      }),
    ).rejects.toBeInstanceOf(DatosActividadInvalidosError);
  });

  it("rechaza una cantidad objetivo no positiva", async () => {
    const { deps, agua } = ctx;

    await expect(
      crearActividad(deps, {
      adminId: "admin-1",
        titulo: "Envío",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "ENVIO",
        metas: [{ recursoId: agua.id, cantidadObjetivo: 0 }],
      }),
    ).rejects.toBeInstanceOf(DatosActividadInvalidosError);
  });

  it("rechaza una meta con recurso inexistente", async () => {
    const { deps } = ctx;

    await expect(
      crearActividad(deps, {
      adminId: "admin-1",
        titulo: "Envío",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "ENVIO",
        metas: [{ recursoId: "no-existe", cantidadObjetivo: 10 }],
      }),
    ).rejects.toBeInstanceOf(RecursoInvalidoError);
  });

  it("rechaza una meta con recurso archivado", async () => {
    const { deps, archivado } = ctx;

    await expect(
      crearActividad(deps, {
      adminId: "admin-1",
        titulo: "Envío",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "ENVIO",
        metas: [{ recursoId: archivado.id, cantidadObjetivo: 1 }],
      }),
    ).rejects.toBeInstanceOf(RecursoInvalidoError);
  });

  it("acepta cualquier tipo de actividad (envío, jornada, evento social)", async () => {
    const { deps, agua } = ctx;

    const jornada = await crearActividad(deps, {
      adminId: "admin-1",
      titulo: "Jornada de salud",
      sectorDestino: "Upata",
      fecha: new Date("2026-09-01"),
      tipo: TipoActividad.JORNADA,
      metas: [{ recursoId: agua.id, cantidadObjetivo: 5 }],
    });
    const evento = await crearActividad(deps, {
      adminId: "admin-1",
      titulo: "Feria comunitaria",
      sectorDestino: "San Félix",
      fecha: new Date("2026-09-02"),
      tipo: TipoActividad.EVENTO_SOCIAL,
      metas: [{ recursoId: agua.id, cantidadObjetivo: 5 }],
    });

    expect(jornada.tipo).toBe(TipoActividad.JORNADA);
    expect(evento.tipo).toBe(TipoActividad.EVENTO_SOCIAL);
  });

  it("rechaza un tipo de actividad inválido", async () => {
    const { deps, agua } = ctx;

    await expect(
      crearActividad(deps, {
      adminId: "admin-1",
        titulo: "Envío",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "FIESTA" as TipoActividad,
        metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
      }),
    ).rejects.toBeInstanceOf(DatosActividadInvalidosError);
  });

  it("guarda horaFin cuando se indica (feature 024)", async () => {
    const { deps, agua } = ctx;

    const jornada = await crearActividad(deps, {
      adminId: "admin-1",
      titulo: "Jornada de salud",
      sectorDestino: "Upata",
      fecha: new Date("2026-09-01T00:00:00.000Z"),
      horaFin: new Date("2026-09-01T13:00:00.000Z"),
      tipo: TipoActividad.JORNADA,
      metas: [{ recursoId: agua.id, cantidadObjetivo: 5 }],
    });

    expect(jornada.horaFin).toEqual(new Date("2026-09-01T13:00:00.000Z"));
  });

  it("asocia varios puntos de acopio propios (feature 026)", async () => {
    const { deps, agua } = ctx;
    const puntos = new InMemoryPuntoAcopioRepository();
    const uno = await crearPunto(puntos, "admin-1", "Galpón central");
    const dos = await crearPunto(puntos, "admin-1", "Sede norte");

    const actividad = await crearActividad(
      { ...deps, puntos },
      {
        adminId: "admin-1",
        titulo: "Envío a Upata",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "ENVIO",
        puntosAcopioIds: [uno.id, dos.id],
        metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
      },
    );

    expect(actividad.puntosAcopio.map((p) => p.id).sort()).toEqual(
      [uno.id, dos.id].sort(),
    );
  });

  it("deduplica ids de punto repetidos (feature 026)", async () => {
    const { deps, agua } = ctx;
    const puntos = new InMemoryPuntoAcopioRepository();
    const uno = await crearPunto(puntos, "admin-1", "Galpón central");

    const actividad = await crearActividad(
      { ...deps, puntos },
      {
        adminId: "admin-1",
        titulo: "Envío a Upata",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "ENVIO",
        puntosAcopioIds: [uno.id, uno.id],
        metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
      },
    );

    expect(actividad.puntosAcopio).toHaveLength(1);
    expect(actividad.puntosAcopio[0]!.id).toBe(uno.id);
  });

  it("permite crear sin centros de acopio (feature 026)", async () => {
    const { deps, agua } = ctx;
    const puntos = new InMemoryPuntoAcopioRepository();

    const actividad = await crearActividad(
      { ...deps, puntos },
      {
        adminId: "admin-1",
        titulo: "Actividad informativa",
        sectorDestino: "Upata",
        fecha: new Date(),
        tipo: "ENVIO",
        puntosAcopioIds: [],
        metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
      },
    );

    expect(actividad.puntosAcopio).toEqual([]);
  });

  it("rechaza si algún punto es de otro admin (feature 026)", async () => {
    const { deps, agua } = ctx;
    const puntos = new InMemoryPuntoAcopioRepository();
    const propio = await crearPunto(puntos, "admin-1", "Galpón central");
    const ajeno = await crearPunto(puntos, "admin-2", "Punto ajeno");

    await expect(
      crearActividad(
        { ...deps, puntos },
        {
          adminId: "admin-1",
          titulo: "Envío a Upata",
          sectorDestino: "Upata",
          fecha: new Date(),
          tipo: "ENVIO",
          puntosAcopioIds: [propio.id, ajeno.id],
          metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
        },
      ),
    ).rejects.toBeInstanceOf(PuntoAcopioInvalidoError);
  });
});
