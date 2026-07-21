import { describe, expect, it } from "vitest";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { EstadoTestimonio, type Testimonio } from "../domain";
import {
  crearTestimonio,
  editarTestimonio,
  rechazarTestimonio,
} from "./gestionarTestimonios";
import { SolicitudTestimonioInvalidaError } from "./errors";

function testimonioBase(): Testimonio {
  const ahora = new Date();
  return {
    id: "t-1",
    autorId: "u-1",
    autor: {
      id: "u-1",
      nombre: "Ana Pérez",
      rol: Rol.SOLICITANTE,
      estado: "La Guaira",
      municipio: "Vargas",
    },
    solicitudId: null,
    solicitud: null,
    titulo: "Una red que sí escucha",
    contenido: "La organización respondió con claridad y acompañó cada paso de nuestra solicitud.",
    estado: EstadoTestimonio.PENDIENTE,
    motivoRechazo: null,
    destacado: false,
    moderadoPorId: null,
    moderadoEn: null,
    createdAt: ahora,
    updatedAt: ahora,
  };
}

function deps() {
  let actual = testimonioBase();
  return {
    testimonios: {
      crear: async () => actual,
      buscarPorId: async () => actual,
      listar: async () => [actual],
      contar: async () => 1,
      editar: async (_id: string, cambios: { titulo: string; contenido: string; solicitudId: string | null }) => {
        actual = { ...actual, ...cambios, estado: EstadoTestimonio.PENDIENTE };
        return actual;
      },
      moderar: async (_id: string, estado: EstadoTestimonio, moderadoPorId: string, motivo = null) => {
        actual = { ...actual, estado, moderadoPorId, motivoRechazo: motivo };
        return actual;
      },
      retirar: async () => actual,
      eliminar: async () => undefined,
      destacarSiHayCupo: async () => actual,
      quitarDestacado: async () => actual,
    },
    solicitudes: {
      buscarPorId: async (id: string) =>
        id === "s-propia"
          ? { id, solicitanteId: "u-1", sector: "Macuto" }
          : { id, solicitanteId: "otra", sector: "Maiquetía" },
    },
  };
}

const relato =
  "La organización respondió con claridad y acompañó cada paso de nuestra solicitud.";

describe("gestión de testimonios", () => {
  it("permite al solicitante vincular una solicitud propia", async () => {
    const creado = await crearTestimonio(
      deps() as never,
      { titulo: "Una ayuda cercana", contenido: relato, solicitudId: "s-propia" },
      { id: "u-1", rol: Rol.SOLICITANTE },
    );
    expect(creado.estado).toBe(EstadoTestimonio.PENDIENTE);
  });

  it("rechaza vincular una solicitud ajena", async () => {
    await expect(
      crearTestimonio(
        deps() as never,
        { titulo: "Una ayuda cercana", contenido: relato, solicitudId: "s-ajena" },
        { id: "u-1", rol: Rol.SOLICITANTE },
      ),
    ).rejects.toBeInstanceOf(SolicitudTestimonioInvalidaError);
  });

  it("al editar un rechazado vuelve a pendiente", async () => {
    const contexto = deps();
    await rechazarTestimonio(
      contexto as never,
      "t-1",
      "Necesita más contexto para poder publicarse.",
      { id: "admin", rol: Rol.ADMIN },
    );
    const editado = await editarTestimonio(
      contexto as never,
      "t-1",
      { titulo: "Una ayuda cercana", contenido: relato },
      { id: "u-1", rol: Rol.SOLICITANTE },
    );
    expect(editado.estado).toBe(EstadoTestimonio.PENDIENTE);
  });
});
