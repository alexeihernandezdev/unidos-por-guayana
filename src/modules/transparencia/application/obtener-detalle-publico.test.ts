import { beforeEach, describe, expect, it } from "vitest";
import { crearAporte } from "@/modules/aportes/application/crearAporte";
import { marcarRecibido } from "@/modules/aportes/application/marcarRecibido";
import { InMemoryAporteRepository } from "@/modules/aportes/application/fakes";
import { crearAyuda } from "@/modules/ayudas/application/crearAyuda";
import { InMemoryAyudaRepository } from "@/modules/ayudas/application/fakes";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { assertSinDatosPersonales } from "./obtener-resumen-publico";
import { obtenerDetallePublico } from "./obtener-detalle-publico";

describe("obtenerDetallePublico", () => {
  let aguaId: string;
  const ayudas = new InMemoryAyudaRepository();
  const recursos = new InMemoryRecursoRepository();
  const aportes = new InMemoryAporteRepository();
  const deps = { ayudas, recursos, aportes };

  beforeEach(async () => {
    ayudas["porId"].clear();
    aportes["porId"].clear();
    const agua = await recursos.crear({
      nombre: "Agua",
      unidad: "L",
      categoria: CategoriaRecurso.SUMINISTRO,
      descripcion: null,
    });
    aguaId = agua.id;
  });

  it("devuelve metas y porcentaje global sin datos personales", async () => {
    const ayuda = await crearAyuda(deps, {
      adminId: "admin-1",
      titulo: "Detalle",
      sectorDestino: "Upata",
      fecha: new Date("2026-10-01"),
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 80 }],
    });
    const aporte = await crearAporte(deps, {
      ayudaId: ayuda.id,
      recursoId: aguaId,
      colaboradorId: "col-privado",
      cantidad: 40,
    });
    await marcarRecibido(deps, aporte.id, { id: "admin", rol: Rol.ADMIN });

    const detalle = await obtenerDetallePublico(deps, ayuda.id);
    expect(detalle).not.toBeNull();
    expect(detalle?.metas[0]).toMatchObject({
      recurso: "Agua",
      cantidadObjetivo: 80,
      cantidadRecibida: 40,
      porcentaje: 50,
    });
    expect(detalle?.porcentajeGlobal).toBe(50);
    assertSinDatosPersonales(detalle);
  });

  it("devuelve null si la actividad no existe", async () => {
    const detalle = await obtenerDetallePublico(deps, "inexistente");
    expect(detalle).toBeNull();
  });
});
