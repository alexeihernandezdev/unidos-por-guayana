import { beforeEach, describe, expect, it } from "vitest";
import { crearAyuda } from "@/modules/ayudas/application/crearAyuda";
import { InMemoryAyudaRepository } from "@/modules/ayudas/application/fakes";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import { Rol } from "@/modules/usuarios/domain/Rol";
import type { AporteDeps } from "./deps";
import {
  MontoInvalidoError,
  NoAutorizadoError,
  RecursoFueraDeMetasError,
  RecursoNoMonetarioError,
} from "./errors";
import { InMemoryAporteRepository } from "./fakes";
import { registrarAporteExterno } from "./registrarAporteExterno";

const ADMIN = { id: "admin-1", rol: Rol.ADMIN } as const;
const COL = { id: "col-1", rol: Rol.COLABORADOR } as const;
const FECHA = new Date("2026-07-03T00:00:00Z");

async function armar() {
  const recursos = new InMemoryRecursoRepository();
  const usd = await recursos.crear({
    nombre: "Donación USD",
    unidad: "USD",
    categoria: CategoriaRecurso.MONETARIO,
    descripcion: null,
  });
  const agua = await recursos.crear({
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const ayudas = new InMemoryAyudaRepository();
  const deps: AporteDeps = {
    aportes: new InMemoryAporteRepository(),
    ayudas,
    recursos,
  };
  return { deps, ayudas, recursos, usdId: usd.id, aguaId: agua.id };
}

describe("registrarAporteExterno", () => {
  let ctx: Awaited<ReturnType<typeof armar>>;
  beforeEach(async () => {
    ctx = await armar();
  });

  it("crea el aporte directamente en RECIBIDO con auditoría del ADMIN", async () => {
    const { deps, usdId } = ctx;
    const aporte = await registrarAporteExterno(
      deps,
      { recursoId: usdId, monto: 50, moneda: "USD", fechaRecepcion: FECHA },
      ADMIN,
    );
    expect(aporte.estado).toBe(EstadoAporte.RECIBIDO);
    expect(aporte.cantidad).toBe(50);
    expect(aporte.moneda).toBe("USD");
    expect(aporte.registradoPorId).toBe(ADMIN.id);
    expect(aporte.recibidoEn).toEqual(FECHA);
  });

  it("admite donación sin colaborador (anónima)", async () => {
    const { deps, usdId } = ctx;
    const aporte = await registrarAporteExterno(
      deps,
      { recursoId: usdId, monto: 20, moneda: "USD", fechaRecepcion: FECHA },
      ADMIN,
    );
    expect(aporte.colaboradorId).toBeNull();
    expect(aporte.registradoPorId).toBe(ADMIN.id);
  });

  it("ata medioDonacionId y colaboradorId cuando se pasan", async () => {
    const { deps, usdId } = ctx;
    const aporte = await registrarAporteExterno(
      deps,
      {
        recursoId: usdId,
        monto: 100,
        moneda: "USD",
        fechaRecepcion: FECHA,
        medioDonacionId: "medio-9",
        colaboradorId: "col-1",
        referencia: "OP-12345",
      },
      ADMIN,
    );
    expect(aporte.medioDonacionId).toBe("medio-9");
    expect(aporte.colaboradorId).toBe("col-1");
    expect(aporte.referencia).toBe("OP-12345");
  });

  it("ata el aporte a una ayuda con meta monetaria y suma a su progreso", async () => {
    const { deps, usdId } = ctx;
    const ayuda = await crearAyuda(deps, {
      adminId: ADMIN.id,
      titulo: "Jornada médica",
      sectorDestino: "Maiquetía",
      fecha: FECHA,
      tipo: "ENVIO",
      metas: [{ recursoId: usdId, cantidadObjetivo: 500 }],
    });
    const aporte = await registrarAporteExterno(
      deps,
      {
        recursoId: usdId,
        monto: 120,
        moneda: "USD",
        fechaRecepcion: FECHA,
        ayudaId: ayuda.id,
      },
      ADMIN,
    );
    expect(aporte.ayudaId).toBe(ayuda.id);
    const progreso = await deps.aportes.progresoPorAyuda(ayuda.id);
    const meta = progreso.find((p) => p.recursoId === usdId);
    expect(meta?.recibido).toBe(120);
  });

  it("rechaza si la ayuda no tiene meta para ese recurso", async () => {
    const { deps, usdId, aguaId } = ctx;
    const ayuda = await crearAyuda(deps, {
      adminId: ADMIN.id,
      titulo: "Envío de agua",
      sectorDestino: "Maiquetía",
      fecha: FECHA,
      tipo: "ENVIO",
      metas: [{ recursoId: aguaId, cantidadObjetivo: 100 }],
    });
    await expect(
      registrarAporteExterno(
        deps,
        {
          recursoId: usdId,
          monto: 10,
          moneda: "USD",
          fechaRecepcion: FECHA,
          ayudaId: ayuda.id,
        },
        ADMIN,
      ),
    ).rejects.toBeInstanceOf(RecursoFueraDeMetasError);
  });

  it("rechaza recurso no MONETARIO", async () => {
    const { deps, aguaId } = ctx;
    await expect(
      registrarAporteExterno(
        deps,
        { recursoId: aguaId, monto: 10, moneda: "USD", fechaRecepcion: FECHA },
        ADMIN,
      ),
    ).rejects.toBeInstanceOf(RecursoNoMonetarioError);
  });

  it("rechaza monto <= 0", async () => {
    const { deps, usdId } = ctx;
    await expect(
      registrarAporteExterno(
        deps,
        { recursoId: usdId, monto: 0, moneda: "USD", fechaRecepcion: FECHA },
        ADMIN,
      ),
    ).rejects.toBeInstanceOf(MontoInvalidoError);
  });

  it("rechaza moneda fuera del conjunto permitido", async () => {
    const { deps, usdId } = ctx;
    await expect(
      registrarAporteExterno(
        deps,
        { recursoId: usdId, monto: 10, moneda: "BTC", fechaRecepcion: FECHA },
        ADMIN,
      ),
    ).rejects.toBeInstanceOf(MontoInvalidoError);
  });

  it("rechaza a un actor que no es ADMIN", async () => {
    const { deps, usdId } = ctx;
    await expect(
      registrarAporteExterno(
        deps,
        { recursoId: usdId, monto: 10, moneda: "USD", fechaRecepcion: FECHA },
        COL,
      ),
    ).rejects.toBeInstanceOf(NoAutorizadoError);
  });
});
