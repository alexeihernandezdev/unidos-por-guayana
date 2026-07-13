import { describe, expect, it } from "vitest";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoVerificacion } from "@/modules/usuarios/domain/Rol";
import { InMemoryAfiliacionRepository } from "./fakes";
import { listarRedAptaPorCategoria } from "./consultarRed";

async function armar() {
  const afiliaciones = new InMemoryAfiliacionRepository();
  afiliaciones.registrarColaborador("col-a", {
    nombre: "Ana",
    categorias: [CategoriaRecurso.SUMINISTRO, CategoriaRecurso.TRANSPORTE],
    estadoVerificacion: EstadoVerificacion.VERIFICADO,
    telefono: "04140000000",
    telefonoEsWhatsApp: true,
  });
  afiliaciones.registrarColaborador("col-b", {
    nombre: "Beto",
    categorias: [CategoriaRecurso.SUMINISTRO],
    estadoVerificacion: EstadoVerificacion.PENDIENTE,
    telefono: "04140000001",
    telefonoEsWhatsApp: false,
  });
  await afiliaciones.afiliar("col-a", "admin-1");
  await afiliaciones.afiliar("col-b", "admin-1");
  return { afiliaciones };
}

describe("listarRedAptaPorCategoria (feature 026)", () => {
  it("agrupa a los miembros bajo cada categoría que declaran", async () => {
    const { afiliaciones } = await armar();

    const red = await listarRedAptaPorCategoria({ afiliaciones }, "admin-1");

    expect(red[CategoriaRecurso.SUMINISTRO].map((m) => m.nombre).sort()).toEqual([
      "Ana",
      "Beto",
    ]);
    expect(red[CategoriaRecurso.TRANSPORTE].map((m) => m.nombre)).toEqual(["Ana"]);
    expect(red[CategoriaRecurso.PERSONAL]).toEqual([]);
    expect(red[CategoriaRecurso.MONETARIO]).toEqual([]);
  });

  it("incluye verificados y no verificados, marcados por `verificado`", async () => {
    const { afiliaciones } = await armar();

    const red = await listarRedAptaPorCategoria({ afiliaciones }, "admin-1");

    const suministro = red[CategoriaRecurso.SUMINISTRO];
    const ana = suministro.find((m) => m.nombre === "Ana");
    const beto = suministro.find((m) => m.nombre === "Beto");
    expect(ana?.verificado).toBe(true);
    expect(beto?.verificado).toBe(false);
  });

  it("no expone datos de contacto en el DTO recortado", async () => {
    const { afiliaciones } = await armar();

    const red = await listarRedAptaPorCategoria({ afiliaciones }, "admin-1");

    const miembro = red[CategoriaRecurso.SUMINISTRO][0]!;
    expect(Object.keys(miembro).sort()).toEqual([
      "categorias",
      "colaboradorId",
      "nombre",
      "verificado",
    ]);
    expect("telefono" in miembro).toBe(false);
  });
});
