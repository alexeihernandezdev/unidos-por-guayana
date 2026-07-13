import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { InMemoryPuntoAcopioRepository } from "@/modules/acopio/application/fakes";
import { avanzarEstado } from "./avanzarEstado";
import { crearActividad } from "./crearActividad";
import type { ActividadDeps } from "./deps";
import { editarCabecera } from "./editarCabecera";
import {
  ActividadNoPerteneceAlAdminError,
  ActividadNoEditableError,
  DatosActividadInvalidosError,
} from "./errors";
import { InMemoryActividadRepository } from "./fakes";

const ADMIN = "admin-1";
const OTRO_ADMIN = "admin-2";

async function crearActividadBase() {
  const recursos = new InMemoryRecursoRepository();
  const agua = await recursos.crear({
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const deps: ActividadDeps = { actividades: new InMemoryActividadRepository(), recursos };
  const ayuda = await crearActividad(deps, {
    adminId: ADMIN,
    titulo: "Envío",
    sectorDestino: "Upata",
    fecha: new Date("2026-08-01T00:00:00.000Z"),
    tipo: "ENVIO",
    metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
  });
  return { deps, ayuda };
}

describe("editarCabecera", () => {
  let ctx: Awaited<ReturnType<typeof crearActividadBase>>;

  beforeEach(async () => {
    ctx = await crearActividadBase();
  });

  it("edita la cabecera mientras la ayuda está en RECOLECTANDO", async () => {
    const { deps, ayuda } = ctx;

    const actualizada = await editarCabecera(deps, ayuda.id, ADMIN, {
      titulo: "  Envío urgente a Upata ",
      sectorDestino: "Upata Norte",
    });

    expect(actualizada.titulo).toBe("Envío urgente a Upata");
    expect(actualizada.sectorDestino).toBe("Upata Norte");
    expect(actualizada.adminId).toBe(ADMIN);
  });

  it("rechaza un título vacío", async () => {
    const { deps, ayuda } = ctx;

    await expect(
      editarCabecera(deps, ayuda.id, ADMIN, { titulo: "   " }),
    ).rejects.toBeInstanceOf(DatosActividadInvalidosError);
  });

  it("no cambia el tipo ni el dueño al editar la cabecera", async () => {
    const { deps, ayuda } = ctx;

    const actualizada = await editarCabecera(deps, ayuda.id, ADMIN, {
      titulo: "Otro título",
    });

    expect(actualizada.tipo).toBe(ayuda.tipo);
    expect(actualizada.adminId).toBe(ADMIN);
  });

  it("bloquea la edición una vez la ayuda pasa a LISTO", async () => {
    const { deps, ayuda } = ctx;
    await avanzarEstado(deps, ayuda.id, ADMIN);

    await expect(
      editarCabecera(deps, ayuda.id, ADMIN, { titulo: "Otro título" }),
    ).rejects.toBeInstanceOf(ActividadNoEditableError);
  });

  it("rechaza editar una actividad de otro administrador", async () => {
    const { deps, ayuda } = ctx;

    await expect(
      editarCabecera(deps, ayuda.id, OTRO_ADMIN, { titulo: "Hack" }),
    ).rejects.toBeInstanceOf(ActividadNoPerteneceAlAdminError);
  });

  it("reemplaza el conjunto de centros de acopio (feature 026)", async () => {
    const { deps, ayuda } = ctx;
    const puntos = new InMemoryPuntoAcopioRepository();
    const nuevoPunto = async (nombre: string) =>
      puntos.crear({
        adminId: ADMIN,
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
    const uno = await nuevoPunto("Galpón");
    const dos = await nuevoPunto("Sede norte");

    const conUno = await editarCabecera(
      { ...deps, puntos },
      ayuda.id,
      ADMIN,
      { puntosAcopioIds: [uno.id] },
    );
    expect(conUno.puntosAcopio.map((p) => p.id)).toEqual([uno.id]);

    const conDos = await editarCabecera(
      { ...deps, puntos },
      ayuda.id,
      ADMIN,
      { puntosAcopioIds: [dos.id] },
    );
    expect(conDos.puntosAcopio.map((p) => p.id)).toEqual([dos.id]);
  });
});
