import type { PuntoAcopio } from "@/modules/acopio/domain/PuntoAcopio";
import { catalogoDePrueba } from "@/modules/ubicacion/application/fakes";
import { beforeEach, describe, expect, it } from "vitest";
import {
  activarPuntoAcopio,
  archivarPuntoAcopio,
} from "./archivarPuntoAcopio";
import { crearPuntoAcopio } from "./crearPuntoAcopio";
import {
  PuntoAcopioAjenoError,
  PuntoAcopioNoEncontradoError,
} from "./errors";
import {
  InMemoryLectorUbicacionAdmin,
  InMemoryPuntoAcopioRepository,
} from "./fakes";

const ADMIN_ID = "admin-1";
const OTRO_ADMIN = "admin-2";

async function armar(): Promise<{
  puntos: InMemoryPuntoAcopioRepository;
  punto: PuntoAcopio;
}> {
  const cat = catalogoDePrueba();
  const puntos = new InMemoryPuntoAcopioRepository();
  const ubicacionAdmin = new InMemoryLectorUbicacionAdmin();
  ubicacionAdmin.registrar(ADMIN_ID, {
    estadoId: cat.guaira.id,
    municipioId: cat.vargas.id,
  });
  const punto = await crearPuntoAcopio(
    { puntos, ubicacionAdmin, catalogoUbicacion: cat.repo },
    ADMIN_ID,
    {
      nombre: "Sede",
      referencia: "Ref",
      latitud: "10",
      longitud: "-66",
      horarios: "Lu-Vi",
      telefono: "+58",
      telefonoEsWhatsApp: true,
      correo: null,
      estadoId: "",
      municipioId: "",
    },
  );
  return { puntos, punto };
}

describe("archivarPuntoAcopio / activarPuntoAcopio", () => {
  let ctx: Awaited<ReturnType<typeof armar>>;

  beforeEach(async () => {
    ctx = await armar();
  });

  it("archiva un punto activo (activo = false)", async () => {
    const archivado = await archivarPuntoAcopio(
      { puntos: ctx.puntos },
      ADMIN_ID,
      ctx.punto.id,
    );
    expect(archivado.activo).toBe(false);
  });

  it("reactiva un punto archivado", async () => {
    await archivarPuntoAcopio({ puntos: ctx.puntos }, ADMIN_ID, ctx.punto.id);
    const activo = await activarPuntoAcopio(
      { puntos: ctx.puntos },
      ADMIN_ID,
      ctx.punto.id,
    );
    expect(activo.activo).toBe(true);
  });

  it("es idempotente: archivar un ya-archivado no falla", async () => {
    await archivarPuntoAcopio({ puntos: ctx.puntos }, ADMIN_ID, ctx.punto.id);
    const doble = await archivarPuntoAcopio(
      { puntos: ctx.puntos },
      ADMIN_ID,
      ctx.punto.id,
    );
    expect(doble.activo).toBe(false);
  });

  it("rechaza cuando el punto no existe", async () => {
    await expect(
      archivarPuntoAcopio({ puntos: ctx.puntos }, ADMIN_ID, "no-existe"),
    ).rejects.toBeInstanceOf(PuntoAcopioNoEncontradoError);
  });

  it("rechaza cuando el admin no es el dueño (propiedad)", async () => {
    await expect(
      archivarPuntoAcopio({ puntos: ctx.puntos }, OTRO_ADMIN, ctx.punto.id),
    ).rejects.toBeInstanceOf(PuntoAcopioAjenoError);
    await expect(
      activarPuntoAcopio({ puntos: ctx.puntos }, OTRO_ADMIN, ctx.punto.id),
    ).rejects.toBeInstanceOf(PuntoAcopioAjenoError);
  });
});
