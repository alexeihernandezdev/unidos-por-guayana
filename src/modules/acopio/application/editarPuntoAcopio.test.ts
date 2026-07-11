import type { PuntoAcopio } from "@/modules/acopio/domain/PuntoAcopio";
import { catalogoDePrueba } from "@/modules/ubicacion/application/fakes";
import { beforeEach, describe, expect, it } from "vitest";
import {
  DatosPuntoAcopioInvalidosError,
  NombrePuntoDuplicadoError,
  PuntoAcopioAjenoError,
  PuntoAcopioNoEncontradoError,
} from "./errors";
import {
  InMemoryLectorUbicacionAdmin,
  InMemoryPuntoAcopioRepository,
} from "./fakes";
import { crearPuntoAcopio } from "./crearPuntoAcopio";
import { editarPuntoAcopio } from "./editarPuntoAcopio";

const ADMIN_ID = "admin-1";
const OTRO_ADMIN = "admin-2";

async function armar(): Promise<{
  puntos: InMemoryPuntoAcopioRepository;
  catalogoUbicacion: ReturnType<typeof catalogoDePrueba>["repo"];
  punto: PuntoAcopio;
  guairaId: string;
  vargasId: string;
  mirandaId: string;
  barutaId: string;
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
      nombre: "Sede Chacao",
      referencia: "Casa amarilla",
      latitud: "10.5",
      longitud: "-66.9",
      horarios: "Lu-Vi 9:00-17:00",
      telefono: "+58 412 0000000",
      telefonoEsWhatsApp: true,
      correo: null,
      estadoId: "",
      municipioId: "",
    },
  );
  return {
    puntos,
    catalogoUbicacion: cat.repo,
    punto,
    guairaId: cat.guaira.id,
    vargasId: cat.vargas.id,
    mirandaId: cat.miranda.id,
    barutaId: cat.baruta.id,
  };
}

describe("editarPuntoAcopio", () => {
  let ctx: Awaited<ReturnType<typeof armar>>;

  beforeEach(async () => {
    ctx = await armar();
  });

  it("actualiza los campos indicados y deja intactos los demás", async () => {
    const editado = await editarPuntoAcopio(
      { puntos: ctx.puntos, catalogoUbicacion: ctx.catalogoUbicacion },
      ADMIN_ID,
      ctx.punto.id,
      { nombre: "Sede Chacao Norte" },
    );
    expect(editado.nombre).toBe("Sede Chacao Norte");
    expect(editado.referencia).toBe(ctx.punto.referencia);
    expect(editado.estadoId).toBe(ctx.punto.estadoId);
  });

  it("rechaza cuando el punto no existe", async () => {
    await expect(
      editarPuntoAcopio(
        { puntos: ctx.puntos, catalogoUbicacion: ctx.catalogoUbicacion },
        ADMIN_ID,
        "no-existe",
        { nombre: "X" },
      ),
    ).rejects.toBeInstanceOf(PuntoAcopioNoEncontradoError);
  });

  it("rechaza cuando el admin no es el dueño (propiedad)", async () => {
    await expect(
      editarPuntoAcopio(
        { puntos: ctx.puntos, catalogoUbicacion: ctx.catalogoUbicacion },
        OTRO_ADMIN,
        ctx.punto.id,
        { nombre: "X" },
      ),
    ).rejects.toBeInstanceOf(PuntoAcopioAjenoError);
  });

  it("rechaza nombre vacío", async () => {
    await expect(
      editarPuntoAcopio(
        { puntos: ctx.puntos, catalogoUbicacion: ctx.catalogoUbicacion },
        ADMIN_ID,
        ctx.punto.id,
        { nombre: "   " },
      ),
    ).rejects.toBeInstanceOf(DatosPuntoAcopioInvalidosError);
  });

  it("rechaza coordenadas fuera de rango", async () => {
    await expect(
      editarPuntoAcopio(
        { puntos: ctx.puntos, catalogoUbicacion: ctx.catalogoUbicacion },
        ADMIN_ID,
        ctx.punto.id,
        { latitud: "91" },
      ),
    ).rejects.toBeInstanceOf(DatosPuntoAcopioInvalidosError);
  });

  it("permite cambiar estado y municipio a un par coherente", async () => {
    const editado = await editarPuntoAcopio(
      { puntos: ctx.puntos, catalogoUbicacion: ctx.catalogoUbicacion },
      ADMIN_ID,
      ctx.punto.id,
      { estadoId: ctx.mirandaId, municipioId: ctx.barutaId },
    );
    expect(editado.estadoId).toBe(ctx.mirandaId);
    expect(editado.municipioId).toBe(ctx.barutaId);
  });

  it("rechaza cuando el nuevo municipio no pertenece al nuevo estado", async () => {
    await expect(
      editarPuntoAcopio(
        { puntos: ctx.puntos, catalogoUbicacion: ctx.catalogoUbicacion },
        ADMIN_ID,
        ctx.punto.id,
        { estadoId: ctx.guairaId, municipioId: ctx.barutaId },
      ),
    ).rejects.toBeInstanceOf(DatosPuntoAcopioInvalidosError);
  });

  it("rechaza al cambiar solo el estado cuando el municipio actual queda huérfano", async () => {
    // El punto está en (guaira, vargas); si cambia solo el estado a miranda,
    // el municipio actual (vargas) ya no pertenece.
    await expect(
      editarPuntoAcopio(
        { puntos: ctx.puntos, catalogoUbicacion: ctx.catalogoUbicacion },
        ADMIN_ID,
        ctx.punto.id,
        { estadoId: ctx.mirandaId },
      ),
    ).rejects.toBeInstanceOf(DatosPuntoAcopioInvalidosError);
  });

  it("rechaza nombre duplicado dentro del mismo admin", async () => {
    // Crear un segundo punto y luego intentar renombrarlo al del primero.
    const cat2 = catalogoDePrueba();
    const ubi = new InMemoryLectorUbicacionAdmin();
    ubi.registrar(ADMIN_ID, {
      estadoId: cat2.guaira.id,
      municipioId: cat2.vargas.id,
    });
    const segundo = await crearPuntoAcopio(
      { puntos: ctx.puntos, ubicacionAdmin: ubi, catalogoUbicacion: cat2.repo },
      ADMIN_ID,
      {
        nombre: "Sede Sur",
        referencia: "Otra casa",
        latitud: "10.4",
        longitud: "-66.8",
        horarios: "Lu-Vi",
        telefono: "+58",
        telefonoEsWhatsApp: true,
        correo: null,
        estadoId: "",
        municipioId: "",
      },
    );
    await expect(
      editarPuntoAcopio(
        { puntos: ctx.puntos, catalogoUbicacion: ctx.catalogoUbicacion },
        ADMIN_ID,
        segundo.id,
        { nombre: ctx.punto.nombre },
      ),
    ).rejects.toBeInstanceOf(NombrePuntoDuplicadoError);
  });
});
