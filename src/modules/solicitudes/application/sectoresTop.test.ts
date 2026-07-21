import { describe, expect, it } from "vitest";
import { crearSolicitud } from "@/modules/solicitudes/application/crearSolicitud";
import { sectoresTop } from "./sectoresTop";
import { InMemorySolicitudRepository } from "./fakes";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";

describe("sectoresTop", () => {
  it("normaliza sectores y limita el top", async () => {
    const recursos = new InMemoryRecursoRepository();
    const agua = await recursos.crear({
      nombre: "Agua",
      unidad: "L",
      categoria: CategoriaRecurso.SUMINISTRO,
      descripcion: null,
    });
    const deps = {
      solicitudes: new InMemorySolicitudRepository(),
      recursos,
    };
    const base = {
      urgencia: UrgenciaSolicitud.BAJA,
      descripcion: "Necesidad",
      recursos: [{ recursoId: agua.id, cantidadEstimada: 5 }],
    };
    await crearSolicitud(deps, { ...base, sector: "Petare" }, "sol-1");
    await crearSolicitud(deps, { ...base, sector: " petare " }, "sol-1");
    await crearSolicitud(deps, { ...base, sector: "Upata" }, "sol-1");

    const top = await sectoresTop(deps, { estado: EstadoSolicitud.ABIERTA }, 2);
    expect(top).toHaveLength(2);
    expect(top[0]?.sector).toBe("Petare");
    expect(top[0]?.conteo).toBe(2);
  });
});
