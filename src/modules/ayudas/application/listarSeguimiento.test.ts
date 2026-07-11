import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import { avanzarEstado } from "./avanzarEstado";
import { crearAyuda } from "./crearAyuda";
import type { AyudaDeps } from "./deps";
import { InMemoryAyudaRepository } from "./fakes";
import { listarSeguimiento, listarSeguimientoPublico } from "./listarSeguimiento";

const ADMIN = "admin-1";

async function crearAyudaBase() {
  const recursos = new InMemoryRecursoRepository();
  const agua = await recursos.crear({
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const deps: AyudaDeps = { ayudas: new InMemoryAyudaRepository(), recursos };
  const ayuda = await crearAyuda(deps, {
    adminId: ADMIN,
    titulo: "Envío",
    sectorDestino: "Upata",
    fecha: new Date(),
    tipo: "ENVIO",
    metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
  });
  return { deps, ayuda };
}

describe("listarSeguimiento", () => {
  let ctx: Awaited<ReturnType<typeof crearAyudaBase>>;

  beforeEach(async () => {
    ctx = await crearAyudaBase();
  });

  it("devuelve el historial en orden cronológico ascendente", async () => {
    const { deps, ayuda } = ctx;
    await avanzarEstado(deps, ayuda.id, ADMIN); // LISTO
    await avanzarEstado(deps, ayuda.id, ADMIN); // EN_TRANSITO

    const eventos = await listarSeguimiento(deps, ayuda.id);

    expect(eventos.map((e) => e.estadoNuevo)).toEqual([
      EstadoAyuda.RECOLECTANDO,
      EstadoAyuda.LISTO,
      EstadoAyuda.EN_TRANSITO,
    ]);
    for (let i = 1; i < eventos.length; i++) {
      expect(eventos[i].ocurridoEn.getTime()).toBeGreaterThanOrEqual(
        eventos[i - 1].ocurridoEn.getTime(),
      );
    }
  });

  it("la lectura pública NO incluye registradoPor", async () => {
    const { deps, ayuda } = ctx;
    await avanzarEstado(deps, ayuda.id, ADMIN, {
      nota: "Salió del acopio",
      evidenciaUrl: "https://fotos.example/1.jpg",
    });

    const publico = await listarSeguimientoPublico(deps, ayuda.id);

    expect(publico.length).toBeGreaterThan(0);
    for (const evento of publico) {
      expect(evento).not.toHaveProperty("registradoPor");
    }
    // Conserva la traza no personal (nota y evidencia siguen visibles).
    const conNota = publico.find((e) => e.nota === "Salió del acopio");
    expect(conNota?.evidenciaUrl).toBe("https://fotos.example/1.jpg");
    // Aserción de refuerzo: el JSON público no menciona el campo.
    expect(JSON.stringify(publico)).not.toContain("registradoPor");
  });
});
