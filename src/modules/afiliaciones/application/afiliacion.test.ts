import { beforeEach, describe, expect, it } from "vitest";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import {
  afiliarseACentro,
  dejarCentro,
  removerDeRed,
} from "./gestionarAfiliacion";
import {
  contarAptosPorCategoria,
  listarCentrosDisponibles,
  listarDestinatariosConvocatoria,
  listarMiRed,
} from "./consultarRed";
import { NoAutorizadoError } from "./errors";
import {
  InMemoryAfiliacionRepository,
  InMemoryLectorCentrosDisponibles,
} from "./fakes";

function repo() {
  return new InMemoryAfiliacionRepository();
}

describe("afiliarseACentro", () => {
  let afiliaciones: InMemoryAfiliacionRepository;
  beforeEach(() => {
    afiliaciones = repo();
  });

  it("es inmediato y no duplica el vínculo (unicidad)", async () => {
    const a1 = await afiliarseACentro({ afiliaciones }, "colab-1", "admin-1");
    const a2 = await afiliarseACentro({ afiliaciones }, "colab-1", "admin-1");
    expect(a1.id).toBe(a2.id);
    expect(await afiliaciones.listarAdminIdsDeColaborador("colab-1")).toEqual([
      "admin-1",
    ]);
  });

  it("permite afiliarse a varios admins", async () => {
    await afiliarseACentro({ afiliaciones }, "colab-1", "admin-1");
    await afiliarseACentro({ afiliaciones }, "colab-1", "admin-2");
    expect(
      (await afiliaciones.listarAdminIdsDeColaborador("colab-1")).sort(),
    ).toEqual(["admin-1", "admin-2"]);
  });
});

describe("removerDeRed", () => {
  let afiliaciones: InMemoryAfiliacionRepository;
  beforeEach(async () => {
    afiliaciones = repo();
    await afiliaciones.afiliar("colab-1", "admin-1");
  });

  it("un admin remueve de su red y el colaborador puede re-afiliarse", async () => {
    await removerDeRed({ afiliaciones }, "admin-1", "colab-1");
    expect(await afiliaciones.buscar("colab-1", "admin-1")).toBeNull();
    // Re-afiliarse sin restricción.
    await afiliarseACentro({ afiliaciones }, "colab-1", "admin-1");
    expect(await afiliaciones.buscar("colab-1", "admin-1")).not.toBeNull();
  });

  it("un admin no puede remover de la red de otro (propiedad)", async () => {
    await expect(
      removerDeRed({ afiliaciones }, "admin-2", "colab-1"),
    ).rejects.toBeInstanceOf(NoAutorizadoError);
    // La afiliación con admin-1 sigue intacta.
    expect(await afiliaciones.buscar("colab-1", "admin-1")).not.toBeNull();
  });

  it("dejarCentro (por el colaborador) borra su vínculo", async () => {
    await dejarCentro({ afiliaciones }, "colab-1", "admin-1");
    expect(await afiliaciones.buscar("colab-1", "admin-1")).toBeNull();
  });
});

describe("conteo de aptos y destinatarios (solo verificados)", () => {
  let afiliaciones: InMemoryAfiliacionRepository;
  beforeEach(async () => {
    afiliaciones = repo();
    afiliaciones.registrarColaborador("v1", {
      nombre: "Ana",
      categorias: [CategoriaRecurso.TRANSPORTE, CategoriaRecurso.PERSONAL],
      estadoVerificacion: "VERIFICADO",
      telefono: "0412",
      telefonoEsWhatsApp: true,
    });
    afiliaciones.registrarColaborador("v2", {
      nombre: "Beto",
      categorias: [CategoriaRecurso.PERSONAL],
      estadoVerificacion: "VERIFICADO",
      telefono: "0414",
      telefonoEsWhatsApp: false,
    });
    afiliaciones.registrarColaborador("p1", {
      nombre: "Caro (pendiente)",
      categorias: [CategoriaRecurso.PERSONAL],
      estadoVerificacion: "PENDIENTE",
      telefono: null,
      telefonoEsWhatsApp: false,
    });
    await afiliaciones.afiliar("v1", "admin-1");
    await afiliaciones.afiliar("v2", "admin-1");
    await afiliaciones.afiliar("p1", "admin-1");
  });

  it("cuenta solo verificados por categoría", async () => {
    const conteo = await contarAptosPorCategoria({ afiliaciones }, "admin-1");
    expect(conteo[CategoriaRecurso.PERSONAL]).toBe(2); // v1, v2 (p1 pendiente no cuenta)
    expect(conteo[CategoriaRecurso.TRANSPORTE]).toBe(1); // v1
    expect(conteo[CategoriaRecurso.MONETARIO]).toBe(0);
  });

  it("destinatarios: verificados cuya categoría intersecta la actividad", async () => {
    const destinatarios = await listarDestinatariosConvocatoria(
      { afiliaciones },
      "admin-1",
      [CategoriaRecurso.TRANSPORTE],
    );
    expect(destinatarios).toEqual(["v1"]); // solo v1 declara TRANSPORTE (verificado)
  });

  it("sin categorías de actividad no hay destinatarios", async () => {
    expect(
      await listarDestinatariosConvocatoria({ afiliaciones }, "admin-1", []),
    ).toEqual([]);
  });

  it("listarMiRed filtra por categoría", async () => {
    const red = await listarMiRed(
      { afiliaciones },
      "admin-1",
      CategoriaRecurso.TRANSPORTE,
    );
    expect(red.map((m) => m.colaboradorId)).toEqual(["v1"]);
  });
});

describe("listarCentrosDisponibles", () => {
  it("marca los centros a los que el colaborador ya está afiliado", async () => {
    const afiliaciones = repo();
    await afiliaciones.afiliar("colab-1", "admin-1");
    const centros = new InMemoryLectorCentrosDisponibles([
      {
        adminId: "admin-1",
        nombreCuenta: "Centro A",
        estadoId: "e1",
        municipioId: "m1",
        estadoNombre: "Miranda",
        municipioNombre: "Chacao",
        puntos: [],
      },
      {
        adminId: "admin-2",
        nombreCuenta: "Centro B",
        estadoId: "e1",
        municipioId: "m2",
        estadoNombre: "Miranda",
        municipioNombre: "Baruta",
        puntos: [],
      },
    ]);

    const lista = await listarCentrosDisponibles(
      { afiliaciones, centros },
      "colab-1",
    );
    expect(lista.find((c) => c.adminId === "admin-1")?.yaAfiliado).toBe(true);
    expect(lista.find((c) => c.adminId === "admin-2")?.yaAfiliado).toBe(false);
  });
});
