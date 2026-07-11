import { beforeEach, describe, expect, it } from "vitest";
import { crearAporte } from "@/modules/aportes/application/crearAporte";
import { marcarRecibido } from "@/modules/aportes/application/marcarRecibido";
import { InMemoryAporteRepository } from "@/modules/aportes/application/fakes";
import { avanzarEstado } from "@/modules/ayudas/application/avanzarEstado";
import { crearAyuda } from "@/modules/ayudas/application/crearAyuda";
import { InMemoryAyudaRepository } from "@/modules/ayudas/application/fakes";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarEnviosPublicos } from "./listarEnviosPublicos";

describe("listarEnviosPublicos", () => {
  let aguaId: string;
  const ayudasRepo = new InMemoryAyudaRepository();
  const recursos = new InMemoryRecursoRepository();
  const aportes = new InMemoryAporteRepository();
  const deps = { ayudas: ayudasRepo, recursos, aportes };

  beforeEach(async () => {
    ayudasRepo["porId"].clear();
    aportes["porId"].clear();
    const agua = await recursos.crear({
      nombre: "Agua",
      unidad: "L",
      categoria: CategoriaRecurso.SUMINISTRO,
      descripcion: null,
    });
    aguaId = agua.id;
  });

  it("incluye todos los estados y ordena por fecha desc", async () => {
    const antigua = await crearAyuda(deps, {
      adminId: "admin-1",
      titulo: "Antigua",
      sectorDestino: "A",
      fecha: new Date("2026-08-01"),
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 100 }],
    });
    await crearAyuda(deps, {
      adminId: "admin-1",
      titulo: "Reciente",
      sectorDestino: "B",
      fecha: new Date("2026-09-01"),
      tipo: "JORNADA",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 50 }],
    });
    await avanzarEstado(deps, antigua.id, "admin-1");
    await avanzarEstado(deps, antigua.id, "admin-1");
    await avanzarEstado(deps, antigua.id, "admin-1");

    const lista = await listarEnviosPublicos(deps);
    expect(lista).toHaveLength(2);
    expect(lista[0]?.ayuda.titulo).toBe("Reciente");
    expect(lista[1]?.ayuda.estado).toBe("ENTREGADO");
  });

  it("calcula el porcentaje global con aportes RECIBIDO", async () => {
    const ayuda = await crearAyuda(deps, {
      adminId: "admin-1",
      titulo: "Con aporte",
      sectorDestino: "C",
      fecha: new Date("2026-09-10"),
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 100 }],
    });
    const aporte = await crearAporte(deps, {
      ayudaId: ayuda.id,
      recursoId: aguaId,
      colaboradorId: "col-1",
      cantidad: 40,
    });
    await marcarRecibido(deps, aporte.id, { id: "admin", rol: Rol.ADMIN });

    const lista = await listarEnviosPublicos(deps);
    expect(lista[0]?.porcentaje).toBe(40);
  });
});
