import { beforeEach, describe, expect, it } from "vitest";
import { TipoMedioDonacion } from "@/modules/donaciones/domain/TipoMedioDonacion";
import { crearMedioDonacion } from "./crearMedioDonacion";
import { desactivarMedioDonacion } from "./cambiarActivoMedioDonacion";
import { listarMediosPublicables } from "./listarMediosDonacion";
import { DatosMedioInvalidosError } from "./errors";
import { InMemoryMedioDonacionRepository } from "./fakes";

function armar() {
  const medios = new InMemoryMedioDonacionRepository();
  return { medios, deps: { medios } };
}

const BASE = {
  tipo: TipoMedioDonacion.ZELLE,
  titular: "Fundación La Guaira",
  moneda: "USD",
  datos: "donaciones@laguaira.org",
  nota: null as string | null,
};

describe("crearMedioDonacion", () => {
  it("crea el medio activo por defecto", async () => {
    const { deps } = armar();
    const medio = await crearMedioDonacion(deps, BASE);
    expect(medio.activo).toBe(true);
    expect(medio.titular).toBe("Fundación La Guaira");
    expect(medio.moneda).toBe("USD");
  });

  it("recorta titular y datos", async () => {
    const { deps } = armar();
    const medio = await crearMedioDonacion(deps, {
      ...BASE,
      titular: "  Pago Móvil BDV  ",
      datos: "  0102 12345678  ",
    });
    expect(medio.titular).toBe("Pago Móvil BDV");
    expect(medio.datos).toBe("0102 12345678");
  });

  it("rechaza titular vacío", async () => {
    const { deps } = armar();
    await expect(
      crearMedioDonacion(deps, { ...BASE, titular: "   " }),
    ).rejects.toBeInstanceOf(DatosMedioInvalidosError);
  });

  it("rechaza datos vacíos", async () => {
    const { deps } = armar();
    await expect(
      crearMedioDonacion(deps, { ...BASE, datos: "" }),
    ).rejects.toBeInstanceOf(DatosMedioInvalidosError);
  });

  it("rechaza moneda fuera del conjunto permitido", async () => {
    const { deps } = armar();
    await expect(
      crearMedioDonacion(deps, { ...BASE, moneda: "BTC" }),
    ).rejects.toBeInstanceOf(DatosMedioInvalidosError);
  });
});

describe("listarMediosPublicables", () => {
  let ctx: ReturnType<typeof armar>;
  beforeEach(() => {
    ctx = armar();
  });

  it("devuelve solo los activos, ordenados por orden", async () => {
    const { deps } = ctx;
    const uno = await crearMedioDonacion(deps, { ...BASE, orden: 2 });
    const dos = await crearMedioDonacion(deps, {
      ...BASE,
      tipo: TipoMedioDonacion.PAGO_MOVIL,
      titular: "Pago Móvil",
      moneda: "VES",
      datos: "0102-1234",
      orden: 1,
    });
    const oculto = await crearMedioDonacion(deps, {
      ...BASE,
      tipo: TipoMedioDonacion.BINANCE,
      titular: "Binance Pay",
      datos: "laguaira@binance",
      orden: 3,
    });
    await desactivarMedioDonacion(deps, oculto.id);

    const publicables = await listarMediosPublicables(deps);

    expect(publicables.map((m) => m.id)).toEqual([dos.id, uno.id]);
    expect(publicables.every((m) => m.activo)).toBe(true);
    expect(publicables.some((m) => m.id === oculto.id)).toBe(false);
  });
});
