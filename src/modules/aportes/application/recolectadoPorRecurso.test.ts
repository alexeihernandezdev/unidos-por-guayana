import { beforeEach, describe, expect, it } from "vitest";
import { crearAporte } from "@/modules/aportes/application/crearAporte";
import { marcarRecibido } from "@/modules/aportes/application/marcarRecibido";
import { recolectadoPorRecurso } from "@/modules/aportes/application/recolectadoPorRecurso";
import { InMemoryAporteRepository } from "@/modules/aportes/application/fakes";
import { crearActividad } from "@/modules/actividades/application/crearActividad";
import { InMemoryActividadRepository } from "@/modules/actividades/application/fakes";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { Rol } from "@/modules/usuarios/domain/Rol";

describe("recolectadoPorRecurso", () => {
  let aguaId: string;
  let usdId: string;
  const actividades = new InMemoryActividadRepository();
  const recursos = new InMemoryRecursoRepository();
  const aportes = new InMemoryAporteRepository();
  const deps = { actividades, recursos, aportes };

  beforeEach(async () => {
    actividades["porId"].clear();
    aportes["porId"].clear();
    recursos["porId"].clear();
    const agua = await recursos.crear({
      nombre: "Agua",
      unidad: "L",
      categoria: CategoriaRecurso.SUMINISTRO,
      descripcion: null,
    });
    const usd = await recursos.crear({
      nombre: "Donación USD",
      unidad: "USD",
      categoria: CategoriaRecurso.MONETARIO,
      descripcion: null,
    });
    aguaId = agua.id;
    usdId = usd.id;
  });

  it("suma solo aportes RECIBIDO y agrupa por recurso", async () => {
    const ayuda = await crearActividad(deps, {
      adminId: "admin-1",
      titulo: "Envío",
      sectorDestino: "A",
      fecha: new Date("2026-09-01"),
      tipo: "ENVIO",
      metas: [
        { recursoId: aguaId, cantidadObjetivo: 100 },
        { recursoId: usdId, cantidadObjetivo: 500 },
      ],
    });
    const aguaAporte = await crearAporte(deps, {
      actividadId: ayuda.id,
      recursoId: aguaId,
      colaboradorId: "col-1",
      cantidad: 30,
    });
    await crearAporte(deps, {
      actividadId: ayuda.id,
      recursoId: aguaId,
      colaboradorId: "col-2",
      cantidad: 20,
    });
    const usdAporte = await crearAporte(deps, {
      actividadId: ayuda.id,
      recursoId: usdId,
      colaboradorId: "col-1",
      cantidad: 100,
    });
    await marcarRecibido(deps, aguaAporte.id, { id: "admin", rol: Rol.ADMIN });
    await marcarRecibido(deps, usdAporte.id, { id: "admin", rol: Rol.ADMIN });

    const filas = await recolectadoPorRecurso(deps);
    expect(filas).toHaveLength(2);
    const agua = filas.find((f) => f.recursoId === aguaId);
    const usd = filas.find((f) => f.recursoId === usdId);
    expect(agua?.cantidadRecibida).toBe(30);
    expect(usd?.categoria).toBe(CategoriaRecurso.MONETARIO);
    expect(usd?.unidad).toBe("USD");
    expect(usd?.cantidadRecibida).toBe(100);
  });
});
