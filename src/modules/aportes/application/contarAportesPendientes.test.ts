import { describe, expect, it } from "vitest";
import { crearAporte } from "@/modules/aportes/application/crearAporte";
import { contarAportesPendientes } from "@/modules/aportes/application/contarAportesPendientes";
import { InMemoryAporteRepository } from "@/modules/aportes/application/fakes";
import { marcarRecibido } from "@/modules/aportes/application/marcarRecibido";
import { crearActividad } from "@/modules/actividades/application/crearActividad";
import { InMemoryActividadRepository } from "@/modules/actividades/application/fakes";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { Rol } from "@/modules/usuarios/domain/Rol";

describe("contarAportesPendientes", () => {
  it("cuenta solo COMPROMETIDO", async () => {
    const recursos = new InMemoryRecursoRepository();
    const agua = await recursos.crear({
      nombre: "Agua",
      unidad: "L",
      categoria: CategoriaRecurso.SUMINISTRO,
      descripcion: null,
    });
    const actividades = new InMemoryActividadRepository();
    const deps = {
      aportes: new InMemoryAporteRepository(),
      actividades,
      recursos,
    };
    const ayuda = await crearActividad(deps, {
      adminId: "admin-1",
      titulo: "Envío",
      sectorDestino: "Upata",
      fecha: new Date(),
      tipo: "ENVIO",
      metas: [{ recursoId: agua.id, cantidadObjetivo: 100 }],
    });
    const a1 = await crearAporte(deps, {
      actividadId: ayuda.id,
      recursoId: agua.id,
      colaboradorId: "col-1",
      cantidad: 10,
    });
    await crearAporte(deps, {
      actividadId: ayuda.id,
      recursoId: agua.id,
      colaboradorId: "col-2",
      cantidad: 5,
    });
    await marcarRecibido(deps, a1.id, { id: "admin", rol: Rol.ADMIN });

    expect(await contarAportesPendientes(deps)).toBe(1);
  });
});
