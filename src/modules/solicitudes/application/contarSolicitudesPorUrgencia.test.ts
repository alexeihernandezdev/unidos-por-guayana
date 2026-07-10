import { describe, expect, it } from "vitest";
import { crearSolicitud } from "@/modules/solicitudes/application/crearSolicitud";
import { contarSolicitudesPorUrgencia } from "./contarSolicitudesPorUrgencia";
import { InMemorySolicitudRepository } from "./fakes";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";

describe("contarSolicitudesPorUrgencia", () => {
  it("cuenta solicitudes abiertas por urgencia", async () => {
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
    const recurso = [{ recursoId: agua.id, cantidadEstimada: 10 }];
    await crearSolicitud(deps, {
      sector: "Upata",
      urgencia: UrgenciaSolicitud.ALTA,
      descripcion: "Urgente",
      solicitanteId: "sol-1",
      recursos: recurso,
    });
    await crearSolicitud(deps, {
      sector: "Tumeremo",
      urgencia: UrgenciaSolicitud.MEDIA,
      descripcion: "Media",
      solicitanteId: "sol-1",
      recursos: recurso,
    });

    const conteos = await contarSolicitudesPorUrgencia(deps);
    expect(conteos.ALTA).toBe(1);
    expect(conteos.MEDIA).toBe(1);
    expect(conteos.BAJA).toBe(0);
  });
});
