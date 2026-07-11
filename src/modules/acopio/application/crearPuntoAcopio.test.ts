import { catalogoDePrueba } from "@/modules/ubicacion/application/fakes";
import { beforeEach, describe, expect, it } from "vitest";
import {
  DatosPuntoAcopioInvalidosError,
  NombrePuntoDuplicadoError,
  UbicacionVaciaError,
} from "./errors";
import {
  InMemoryLectorUbicacionAdmin,
  InMemoryPuntoAcopioRepository,
} from "./fakes";
import {
  crearPuntoAcopio,
  type CrearPuntoAcopioDeps,
  type CrearPuntoAcopioInput,
} from "./crearPuntoAcopio";

const ADMIN_ID = "admin-1";

function armar(): {
  deps: CrearPuntoAcopioDeps;
  puntos: InMemoryPuntoAcopioRepository;
  ubicacionAdmin: InMemoryLectorUbicacionAdmin;
  guairaId: string;
  vargasId: string;
  mirandaId: string;
  barutaId: string;
} {
  const { repo, guaira, miranda, vargas, baruta } = catalogoDePrueba();
  const puntos = new InMemoryPuntoAcopioRepository();
  const ubicacionAdmin = new InMemoryLectorUbicacionAdmin();
  ubicacionAdmin.registrar(ADMIN_ID, {
    estadoId: guaira.id,
    municipioId: vargas.id,
  });
  return {
    deps: { puntos, ubicacionAdmin, catalogoUbicacion: repo },
    puntos,
    ubicacionAdmin,
    guairaId: guaira.id,
    vargasId: vargas.id,
    mirandaId: miranda.id,
    barutaId: baruta.id,
  };
}

function inputValido(
  overrides: Partial<CrearPuntoAcopioInput> = {},
): CrearPuntoAcopioInput {
  return {
    nombre: "Sede Chacao",
    referencia: "Casa amarilla frente al abasto Los Andes",
    latitud: "10.5",
    longitud: "-66.9",
    horarios: "Lu-Vi 9:00-17:00",
    telefono: "+58 412 0000000",
    telefonoEsWhatsApp: true,
    correo: null,
    estadoId: "",
    municipioId: "",
    ...overrides,
  };
}

describe("crearPuntoAcopio", () => {
  let ctx: ReturnType<typeof armar>;

  beforeEach(() => {
    ctx = armar();
  });

  it("crea el punto atado al adminId y hereda la ubicación del perfil", async () => {
    const punto = await crearPuntoAcopio(ctx.deps, ADMIN_ID, inputValido());
    expect(punto.adminId).toBe(ADMIN_ID);
    expect(punto.estadoId).toBe(ctx.guairaId);
    expect(punto.municipioId).toBe(ctx.vargasId);
    expect(punto.activo).toBe(true);
  });

  it("respeta la ubicación del formulario cuando se indica", async () => {
    const punto = await crearPuntoAcopio(
      ctx.deps,
      ADMIN_ID,
      inputValido({ estadoId: ctx.mirandaId, municipioId: ctx.barutaId }),
    );
    expect(punto.estadoId).toBe(ctx.mirandaId);
    expect(punto.municipioId).toBe(ctx.barutaId);
  });

  it("normaliza coordenadas (coma → punto, sin ceros a la derecha)", async () => {
    const punto = await crearPuntoAcopio(
      ctx.deps,
      ADMIN_ID,
      inputValido({ latitud: "10,500000", longitud: "-66.900000" }),
    );
    expect(punto.latitud).toBe("10.5");
    expect(punto.longitud).toBe("-66.9");
  });

  it("rechaza nombre vacío", async () => {
    await expect(
      crearPuntoAcopio(ctx.deps, ADMIN_ID, inputValido({ nombre: "   " })),
    ).rejects.toBeInstanceOf(DatosPuntoAcopioInvalidosError);
  });

  it("rechaza referencia vacía", async () => {
    await expect(
      crearPuntoAcopio(ctx.deps, ADMIN_ID, inputValido({ referencia: "" })),
    ).rejects.toBeInstanceOf(DatosPuntoAcopioInvalidosError);
  });

  it("rechaza teléfono vacío", async () => {
    await expect(
      crearPuntoAcopio(ctx.deps, ADMIN_ID, inputValido({ telefono: "" })),
    ).rejects.toBeInstanceOf(DatosPuntoAcopioInvalidosError);
  });

  it("rechaza latitud fuera de rango", async () => {
    await expect(
      crearPuntoAcopio(ctx.deps, ADMIN_ID, inputValido({ latitud: "91" })),
    ).rejects.toBeInstanceOf(DatosPuntoAcopioInvalidosError);
  });

  it("rechaza longitud fuera de rango", async () => {
    await expect(
      crearPuntoAcopio(ctx.deps, ADMIN_ID, inputValido({ longitud: "-181" })),
    ).rejects.toBeInstanceOf(DatosPuntoAcopioInvalidosError);
  });

  it("rechaza cuando el perfil del admin no tiene ubicación y la entrada tampoco", async () => {
    const sinPerfil = new InMemoryLectorUbicacionAdmin();
    const deps = { ...ctx.deps, ubicacionAdmin: sinPerfil };
    await expect(
      crearPuntoAcopio(deps, ADMIN_ID, inputValido()),
    ).rejects.toBeInstanceOf(UbicacionVaciaError);
  });

  it("rechaza un municipio que no pertenece al estado elegido", async () => {
    await expect(
      crearPuntoAcopio(
        ctx.deps,
        ADMIN_ID,
        inputValido({ estadoId: ctx.guairaId, municipioId: ctx.barutaId }),
      ),
    ).rejects.toBeInstanceOf(DatosPuntoAcopioInvalidosError);
  });

  it("rechaza nombre duplicado dentro del mismo admin", async () => {
    await crearPuntoAcopio(ctx.deps, ADMIN_ID, inputValido());
    await expect(
      crearPuntoAcopio(ctx.deps, ADMIN_ID, inputValido()),
    ).rejects.toBeInstanceOf(NombrePuntoDuplicadoError);
  });

  it("permite mismo nombre en admins distintos", async () => {
    const otroAdmin = "admin-2";
    ctx.ubicacionAdmin.registrar(otroAdmin, {
      estadoId: ctx.guairaId,
      municipioId: ctx.vargasId,
    });
    await crearPuntoAcopio(ctx.deps, ADMIN_ID, inputValido());
    await expect(
      crearPuntoAcopio(ctx.deps, otroAdmin, inputValido()),
    ).resolves.toBeDefined();
  });
});
