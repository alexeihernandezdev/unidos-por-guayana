import { catalogoDePrueba } from "@/modules/ubicacion/application/fakes";
import { beforeEach, describe, expect, it } from "vitest";
import { archivarPuntoAcopio } from "./archivarPuntoAcopio";
import { crearPuntoAcopio } from "./crearPuntoAcopio";
import {
  InMemoryLectorUbicacionAdmin,
  InMemoryPuntoAcopioRepository,
} from "./fakes";
import { listarPuntosDeAdmin } from "./listarPuntosDeAdmin";

const ADMIN_ID = "admin-1";
const OTRO_ADMIN = "admin-2";

async function armar(): Promise<{
  puntos: InMemoryPuntoAcopioRepository;
}> {
  const cat = catalogoDePrueba();
  const puntos = new InMemoryPuntoAcopioRepository();
  const ubicacionAdmin = new InMemoryLectorUbicacionAdmin();
  ubicacionAdmin.registrar(ADMIN_ID, {
    estadoId: cat.guaira.id,
    municipioId: cat.vargas.id,
  });
  ubicacionAdmin.registrar(OTRO_ADMIN, {
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
  const a1 = await crearPuntoAcopio(deps, ADMIN_ID, {
    ...base,
    nombre: "A1",
  });
  await crearPuntoAcopio(deps, ADMIN_ID, { ...base, nombre: "A2" });
  await crearPuntoAcopio(deps, OTRO_ADMIN, { ...base, nombre: "B1" });
  // Archivamos A1 para poder filtrar por activos/archivados.
  await archivarPuntoAcopio({ puntos }, ADMIN_ID, a1.id);
  return { puntos };
}

describe("listarPuntosDeAdmin", () => {
  let ctx: Awaited<ReturnType<typeof armar>>;

  beforeEach(async () => {
    ctx = await armar();
  });

  it("devuelve solo los puntos del admin dueño (aislamiento)", async () => {
    const lista = await listarPuntosDeAdmin({ puntos: ctx.puntos }, ADMIN_ID);
    expect(lista.map((p) => p.nombre).sort()).toEqual(["A1", "A2"]);
  });

  it("filtra solo activos", async () => {
    const lista = await listarPuntosDeAdmin(
      { puntos: ctx.puntos },
      ADMIN_ID,
      { activo: true },
    );
    expect(lista.map((p) => p.nombre)).toEqual(["A2"]);
  });

  it("filtra solo archivados", async () => {
    const lista = await listarPuntosDeAdmin(
      { puntos: ctx.puntos },
      ADMIN_ID,
      { activo: false },
    );
    expect(lista.map((p) => p.nombre)).toEqual(["A1"]);
  });

  it("otro admin ve solo lo suyo", async () => {
    const lista = await listarPuntosDeAdmin({ puntos: ctx.puntos }, OTRO_ADMIN);
    expect(lista.map((p) => p.nombre)).toEqual(["B1"]);
  });
});
