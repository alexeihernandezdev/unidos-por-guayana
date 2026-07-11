import { catalogoDePrueba } from "@/modules/ubicacion/application/fakes";
import { beforeEach, describe, expect, it } from "vitest";
import { archivarPuntoAcopio } from "./archivarPuntoAcopio";
import { crearPuntoAcopio } from "./crearPuntoAcopio";
import {
  InMemoryLectorUbicacionAdmin,
  InMemoryPuntoAcopioRepository,
} from "./fakes";
import {
  listarPuntosActivos,
  verPuntoAcopioActivo,
} from "./listarPuntosActivos";

async function armar(): Promise<{
  puntos: InMemoryPuntoAcopioRepository;
  guairaId: string;
  mirandaId: string;
  archivadoId: string;
}> {
  const cat = catalogoDePrueba();
  const puntos = new InMemoryPuntoAcopioRepository();
  const ubicacionAdmin = new InMemoryLectorUbicacionAdmin();
  ubicacionAdmin.registrar("admin-1", {
    estadoId: cat.guaira.id,
    municipioId: cat.vargas.id,
  });
  ubicacionAdmin.registrar("admin-2", {
    estadoId: cat.miranda.id,
    municipioId: cat.baruta.id,
  });
  const deps = { puntos, ubicacionAdmin, catalogoUbicacion: cat.repo };
  const base = {
    referencia: "Ref",
    latitud: "10",
    longitud: "-66",
    horarios: "Lu-Vi",
    telefono: "+58",
    telefonoEsWhatsApp: true,
    correo: null,
    estadoId: "",
    municipioId: "",
  };
  await crearPuntoAcopio(deps, "admin-1", { ...base, nombre: "Guaira A" });
  await crearPuntoAcopio(deps, "admin-2", { ...base, nombre: "Miranda B" });
  const archivado = await crearPuntoAcopio(deps, "admin-1", {
    ...base,
    nombre: "Guaira archivado",
  });
  await archivarPuntoAcopio({ puntos }, "admin-1", archivado.id);
  return {
    puntos,
    guairaId: cat.guaira.id,
    mirandaId: cat.miranda.id,
    archivadoId: archivado.id,
  };
}

describe("listarPuntosActivos", () => {
  let ctx: Awaited<ReturnType<typeof armar>>;

  beforeEach(async () => {
    ctx = await armar();
  });

  it("lista los activos de toda la red (todos los admins), sin archivados", async () => {
    const lista = await listarPuntosActivos({ puntos: ctx.puntos });
    expect(lista.map((p) => p.nombre).sort()).toEqual([
      "Guaira A",
      "Miranda B",
    ]);
  });

  it("filtra por estado", async () => {
    const lista = await listarPuntosActivos(
      { puntos: ctx.puntos },
      { estadoId: ctx.mirandaId },
    );
    expect(lista.map((p) => p.nombre)).toEqual(["Miranda B"]);
  });
});

describe("verPuntoAcopioActivo", () => {
  let ctx: Awaited<ReturnType<typeof armar>>;

  beforeEach(async () => {
    ctx = await armar();
  });

  it("devuelve null para un punto archivado (no se expone)", async () => {
    expect(
      await verPuntoAcopioActivo({ puntos: ctx.puntos }, ctx.archivadoId),
    ).toBeNull();
  });

  it("devuelve null para un id inexistente", async () => {
    expect(
      await verPuntoAcopioActivo({ puntos: ctx.puntos }, "no-existe"),
    ).toBeNull();
  });

  it("devuelve el punto cuando está activo", async () => {
    const activos = await listarPuntosActivos({ puntos: ctx.puntos });
    const visto = await verPuntoAcopioActivo(
      { puntos: ctx.puntos },
      activos[0].id,
    );
    expect(visto?.id).toBe(activos[0].id);
  });
});
