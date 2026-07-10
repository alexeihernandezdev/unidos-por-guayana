import { describe, expect, it } from "vitest";
import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import type { Aporte } from "@/modules/aportes/domain/Aporte";
import { listarAportantesDeAyuda } from "./listarAportantesDeAyuda";
import { InMemoryAporteRepository } from "./fakes";

const AYUDA_ID = "ayuda-1";
const OTRA_AYUDA = "ayuda-2";

function aporteBase(
  overrides: Partial<Aporte> & Pick<Aporte, "id" | "createdAt">,
): Aporte {
  return {
    ayudaId: AYUDA_ID,
    recursoId: "rec-1",
    colaboradorId: "col-1",
    cantidad: 10,
    estado: EstadoAporte.COMPROMETIDO,
    nota: null,
    recibidoEn: null,
    updatedAt: overrides.createdAt,
    recurso: { id: "rec-1", nombre: "Agua", unidad: "litros" },
    colaborador: { id: "col-1", nombre: "Ana Pérez", email: "ana@ejemplo.com" },
    ...overrides,
  };
}

describe("listarAportantesDeAyuda", () => {
  it("devuelve aportanteNombre sin campos de contacto", async () => {
    const aportes = new InMemoryAporteRepository();
    aportes.seed(
      aporteBase({
        id: "a1",
        createdAt: new Date("2026-07-01T10:00:00Z"),
        colaborador: {
          id: "col-1",
          nombre: "Ana Pérez",
          email: "ana@ejemplo.com",
        },
      }),
    );

    const lista = await listarAportantesDeAyuda({ aportes }, AYUDA_ID);

    expect(lista).toHaveLength(1);
    const fila = lista[0];
    expect(fila.aportanteNombre).toBe("Ana Pérez");
    expect(fila.recursoNombre).toBe("Agua");
    expect(fila.recursoUnidad).toBe("litros");
    expect(fila.cantidad).toBe(10);
    expect(fila.estado).toBe(EstadoAporte.COMPROMETIDO);

    // Invariante de privacidad: el DTO no expone datos de contacto.
    expect(fila).not.toHaveProperty("email");
    expect(fila).not.toHaveProperty("cedula");
    expect(fila).not.toHaveProperty("telefono");
    expect(fila).not.toHaveProperty("parroquia");
    expect(fila).not.toHaveProperty("colaborador");
    expect(Object.keys(fila).sort()).toEqual(
      [
        "aportanteNombre",
        "cantidad",
        "estado",
        "fecha",
        "id",
        "recursoNombre",
        "recursoUnidad",
      ].sort(),
    );
  });

  it("ordena por fecha descendente", async () => {
    const aportes = new InMemoryAporteRepository();
    aportes.seed(
      aporteBase({
        id: "viejo",
        createdAt: new Date("2026-06-01T10:00:00Z"),
        colaborador: { id: "c1", nombre: "Primero", email: "a@x.com" },
      }),
    );
    aportes.seed(
      aporteBase({
        id: "nuevo",
        createdAt: new Date("2026-07-01T10:00:00Z"),
        cantidad: 5,
        colaborador: { id: "c2", nombre: "Segundo", email: "b@x.com" },
        recurso: { id: "rec-2", nombre: "Arroz", unidad: "kg" },
      }),
    );
    aportes.seed(
      aporteBase({
        id: "otra",
        ayudaId: OTRA_AYUDA,
        createdAt: new Date("2026-08-01T10:00:00Z"),
        colaborador: { id: "c3", nombre: "Ajeno", email: "c@x.com" },
      }),
    );

    const lista = await listarAportantesDeAyuda({ aportes }, AYUDA_ID);

    expect(lista.map((a) => a.id)).toEqual(["nuevo", "viejo"]);
    expect(lista.map((a) => a.aportanteNombre)).toEqual(["Segundo", "Primero"]);
  });

  it("devuelve lista vacía cuando la actividad no tiene aportes", async () => {
    const aportes = new InMemoryAporteRepository();
    const lista = await listarAportantesDeAyuda({ aportes }, AYUDA_ID);
    expect(lista).toEqual([]);
  });
});
