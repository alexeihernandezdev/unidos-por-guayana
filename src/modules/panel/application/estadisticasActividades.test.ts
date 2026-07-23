import { describe, expect, it } from "vitest";
import type { Actividad } from "@/modules/actividades/domain/Actividad";
import type { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import { calcularEstadisticasActividades } from "./estadisticasActividades";

// Fábrica mínima de Actividad para las pruebas: solo importan `tipo`, `estado`,
// `createdAt` y el id/título para el feed. El resto son valores de relleno válidos.
function actividad(
  id: string,
  tipo: TipoActividad,
  createdAt: string,
): Actividad {
  return {
    id,
    adminId: "admin-1",
    titulo: `Actividad ${id}`,
    sectorDestino: "Upata",
    fecha: new Date(createdAt),
    horaFin: null,
    estado: "RECOLECTANDO",
    tipo,
    descripcion: null,
    puntosAcopio: [],
    metas: [],
    archivos: [],
    createdAt: new Date(createdAt),
    updatedAt: new Date(createdAt),
  };
}

const AHORA = new Date("2026-07-14T00:00:00Z");

describe("calcularEstadisticasActividades", () => {
  it("cuenta actividades por tipo y el total", () => {
    const est = calcularEstadisticasActividades(
      [
        actividad("1", "ENVIO", "2026-07-01T00:00:00Z"),
        actividad("2", "ENVIO", "2026-07-02T00:00:00Z"),
        actividad("3", "JORNADA", "2026-06-10T00:00:00Z"),
        actividad("4", "EVENTO_SOCIAL", "2026-05-05T00:00:00Z"),
      ],
      AHORA,
    );

    expect(est.conteosPorTipo).toEqual({
      ENVIO: 2,
      JORNADA: 1,
      EVENTO_SOCIAL: 1,
    });
    expect(est.totalActividades).toBe(4);
  });

  it("arma 6 buckets mensuales terminando en el mes de referencia", () => {
    const est = calcularEstadisticasActividades([], AHORA);
    expect(est.serieMensual).toHaveLength(6);
    expect(est.serieMensual.map((p) => p.clave)).toEqual([
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
    ]);
    expect(est.serieMensual.at(-1)?.etiqueta).toBe("Jul");
  });

  it("acumula por mes y tipo, e ignora lo que cae fuera de la ventana", () => {
    const est = calcularEstadisticasActividades(
      [
        actividad("1", "ENVIO", "2026-07-01T00:00:00Z"),
        actividad("2", "JORNADA", "2026-07-20T00:00:00Z"),
        actividad("3", "ENVIO", "2026-06-15T00:00:00Z"),
        actividad("viejo", "ENVIO", "2025-01-01T00:00:00Z"), // fuera de los 6 meses
      ],
      AHORA,
    );

    const julio = est.serieMensual.find((p) => p.clave === "2026-07");
    expect(julio).toMatchObject({ ENVIO: 1, JORNADA: 1, total: 2 });
    const junio = est.serieMensual.find((p) => p.clave === "2026-06");
    expect(junio).toMatchObject({ ENVIO: 1, total: 1 });
    // El total de la serie no incluye la actividad de 2025.
    const totalSerie = est.serieMensual.reduce((acc, p) => acc + p.total, 0);
    expect(totalSerie).toBe(3);
  });

  it("ordena las últimas actividades por createdAt descendente y limita a 6", () => {
    const muchas = Array.from({ length: 8 }, (_, i) =>
      actividad(
        `a${i}`,
        "ENVIO",
        `2026-07-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
      ),
    );
    const est = calcularEstadisticasActividades(muchas, AHORA);

    expect(est.ultimasActividades).toHaveLength(6);
    expect(est.ultimasActividades[0]?.id).toBe("a7"); // el más reciente (día 8)
    expect(est.ultimasActividades.at(-1)?.id).toBe("a2");
  });
});
