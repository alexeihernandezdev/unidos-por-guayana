import { beforeEach, describe, expect, it } from "vitest";
import { crearAporte } from "@/modules/aportes/application/crearAporte";
import { marcarRecibido } from "@/modules/aportes/application/marcarRecibido";
import { InMemoryAporteRepository } from "@/modules/aportes/application/fakes";
import { crearAyuda } from "@/modules/ayudas/application/crearAyuda";
import { InMemoryAyudaRepository } from "@/modules/ayudas/application/fakes";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarPrioridadRecolectando } from "./listarPrioridadRecolectando";

describe("listarPrioridadRecolectando", () => {
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

  it("ordena por porcentaje desc y fecha asc en empate", async () => {
    const tarde = await crearAyuda(deps, {
      adminId: "admin-1",
      titulo: "Tarde",
      sectorDestino: "A",
      fecha: new Date("2026-09-10"),
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 100 }],
    });
    const temprano = await crearAyuda(deps, {
      adminId: "admin-1",
      titulo: "Temprano",
      sectorDestino: "B",
      fecha: new Date("2026-09-01"),
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 100 }],
    });
    const aporteTarde = await crearAporte(deps, {
      ayudaId: tarde.id,
      recursoId: aguaId,
      colaboradorId: "col-1",
      cantidad: 50,
    });
    await crearAporte(deps, {
      ayudaId: temprano.id,
      recursoId: aguaId,
      colaboradorId: "col-1",
      cantidad: 25,
    });
    await marcarRecibido(deps, aporteTarde.id, { id: "admin", rol: Rol.ADMIN });

    const lista = await listarPrioridadRecolectando(deps);
    expect(lista).toHaveLength(2);
    expect(lista[0]?.ayuda.titulo).toBe("Tarde");
    expect(lista[0]?.porcentaje).toBeGreaterThan(lista[1]?.porcentaje ?? 0);
  });

  it("acota la prioridad al adminId", async () => {
    await crearAyuda(deps, {
      adminId: "admin-1",
      titulo: "Mía",
      sectorDestino: "A",
      fecha: new Date("2026-09-01"),
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 100 }],
    });
    await crearAyuda(deps, {
      adminId: "admin-2",
      titulo: "Ajena",
      sectorDestino: "B",
      fecha: new Date("2026-09-02"),
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 100 }],
    });

    const lista = await listarPrioridadRecolectando(deps, "admin-1");
    expect(lista).toHaveLength(1);
    expect(lista[0]?.ayuda.titulo).toBe("Mía");
  });
});
