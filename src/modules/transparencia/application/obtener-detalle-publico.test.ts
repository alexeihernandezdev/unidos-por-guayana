import { beforeEach, describe, expect, it } from "vitest";
import { crearAporte } from "@/modules/aportes/application/crearAporte";
import { marcarRecibido } from "@/modules/aportes/application/marcarRecibido";
import { InMemoryAporteRepository } from "@/modules/aportes/application/fakes";
import { crearActividad } from "@/modules/actividades/application/crearActividad";
import { InMemoryActividadRepository } from "@/modules/actividades/application/fakes";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { FakeStorage } from "@/modules/archivos/application/fakes";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { assertSinDatosPersonales } from "./obtener-resumen-publico";
import { obtenerDetallePublico } from "./obtener-detalle-publico";

describe("obtenerDetallePublico", () => {
  let aguaId: string;
  const actividades = new InMemoryActividadRepository();
  const recursos = new InMemoryRecursoRepository();
  const aportes = new InMemoryAporteRepository();
  const storage = new FakeStorage();
  const deps = { actividades, recursos, aportes, storage };

  beforeEach(async () => {
    actividades["porId"].clear();
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
    const ayuda = await crearActividad(deps, {
      adminId: "admin-1",
      titulo: "Detalle",
      sectorDestino: "Upata",
      fecha: new Date("2026-10-01"),
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 80 }],
    });
    const aporte = await crearAporte(deps, {
      actividadId: ayuda.id,
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

  it("expone portada y adjuntos públicos en el detalle", async () => {
    const ayuda = await crearActividad(deps, {
      adminId: "admin-1",
      titulo: "Con archivos",
      sectorDestino: "Upata",
      fecha: new Date("2026-10-05"),
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 20 }],
    });
    await actividades.crearArchivo({
      actividadId: ayuda.id,
      tipo: "PRINCIPAL",
      path: `actividades/${ayuda.id}/principal/portada.jpg`,
      nombreOriginal: "portada.jpg",
      contentType: "image/jpeg",
      tamanoBytes: 2048,
    });
    await actividades.crearArchivo({
      actividadId: ayuda.id,
      tipo: "ADJUNTO",
      path: `actividades/${ayuda.id}/adjuntos/acta.pdf`,
      nombreOriginal: "acta.pdf",
      contentType: "application/pdf",
      tamanoBytes: 4096,
    });

    const detalle = await obtenerDetallePublico(deps, ayuda.id);
    expect(detalle?.portadaUrl).toContain("/principal/portada.jpg");
    expect(detalle?.adjuntos).toHaveLength(1);
    expect(detalle?.adjuntos[0]?.nombreOriginal).toBe("acta.pdf");
    assertSinDatosPersonales(detalle);
  });

  it("devuelve null si la actividad no existe", async () => {
    const detalle = await obtenerDetallePublico(deps, "inexistente");
    expect(detalle).toBeNull();
  });
});
