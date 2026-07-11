import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecursoRepository } from "@/modules/recursos/application/fakes";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import { avanzarEstado } from "./avanzarEstado";
import { crearAyuda } from "./crearAyuda";
import type { AyudaDeps } from "./deps";
import {
  ActividadNoPerteneceAlAdminError,
  AyudaNoEncontradaError,
  TransicionInvalidaError,
} from "./errors";
import { InMemoryAyudaRepository } from "./fakes";

const ADMIN = "admin-1";
const OTRO_ADMIN = "admin-2";

async function crearAyudaBase() {
  const recursos = new InMemoryRecursoRepository();
  const agua = await recursos.crear({
    nombre: "Agua",
    unidad: "litros",
    categoria: CategoriaRecurso.SUMINISTRO,
    descripcion: null,
  });
  const deps: AyudaDeps = { ayudas: new InMemoryAyudaRepository(), recursos };
  const ayuda = await crearAyuda(deps, {
    adminId: ADMIN,
    titulo: "Envío",
    sectorDestino: "Upata",
    fecha: new Date(),
    tipo: "ENVIO",
    metas: [{ recursoId: agua.id, cantidadObjetivo: 10 }],
  });
  return { deps, ayuda };
}

describe("avanzarEstado", () => {
  let ctx: Awaited<ReturnType<typeof crearAyudaBase>>;

  beforeEach(async () => {
    ctx = await crearAyudaBase();
  });

  it("avanza por toda la secuencia válida hasta ENTREGADO", async () => {
    const { deps, ayuda } = ctx;

    const listo = await avanzarEstado(deps, ayuda.id, ADMIN);
    expect(listo.estado).toBe(EstadoAyuda.LISTO);

    const enTransito = await avanzarEstado(deps, ayuda.id, ADMIN);
    expect(enTransito.estado).toBe(EstadoAyuda.EN_TRANSITO);

    const entregado = await avanzarEstado(deps, ayuda.id, ADMIN);
    expect(entregado.estado).toBe(EstadoAyuda.ENTREGADO);
  });

  it("rechaza avanzar desde el estado terminal ENTREGADO", async () => {
    const { deps, ayuda } = ctx;
    await avanzarEstado(deps, ayuda.id, ADMIN);
    await avanzarEstado(deps, ayuda.id, ADMIN);
    await avanzarEstado(deps, ayuda.id, ADMIN);

    await expect(avanzarEstado(deps, ayuda.id, ADMIN)).rejects.toBeInstanceOf(
      TransicionInvalidaError,
    );
  });

  it("rechaza avanzar una ayuda inexistente", async () => {
    const { deps } = ctx;

    await expect(
      avanzarEstado(deps, "no-existe", ADMIN),
    ).rejects.toBeInstanceOf(AyudaNoEncontradaError);
  });

  it("rechaza avanzar una actividad de otro administrador", async () => {
    const { deps, ayuda } = ctx;

    await expect(
      avanzarEstado(deps, ayuda.id, OTRO_ADMIN),
    ).rejects.toBeInstanceOf(ActividadNoPerteneceAlAdminError);
  });

  it("registra un evento de seguimiento con estadoAnterior/estadoNuevo correctos", async () => {
    const { deps, ayuda } = ctx;

    await avanzarEstado(deps, ayuda.id, ADMIN, {
      nota: "Salió del acopio",
      evidenciaUrl: "https://fotos.example/1.jpg",
    });

    const eventos = await deps.ayudas.listarSeguimiento(ayuda.id);
    // El primero es el evento de creación (estadoAnterior null).
    expect(eventos[0]?.estadoAnterior).toBeNull();
    expect(eventos[0]?.estadoNuevo).toBe(EstadoAyuda.RECOLECTANDO);
    // El último es la transición recién registrada.
    const ultimo = eventos.at(-1);
    expect(ultimo?.estadoAnterior).toBe(EstadoAyuda.RECOLECTANDO);
    expect(ultimo?.estadoNuevo).toBe(EstadoAyuda.LISTO);
    expect(ultimo?.nota).toBe("Salió del acopio");
    expect(ultimo?.evidenciaUrl).toBe("https://fotos.example/1.jpg");
    expect(ultimo?.registradoPor).toBe(ADMIN);
  });

  it("una transición inválida no registra evento ni cambia el estado", async () => {
    const { deps, ayuda } = ctx;
    await avanzarEstado(deps, ayuda.id, ADMIN); // LISTO
    await avanzarEstado(deps, ayuda.id, ADMIN); // EN_TRANSITO
    await avanzarEstado(deps, ayuda.id, ADMIN); // ENTREGADO
    const antes = await deps.ayudas.listarSeguimiento(ayuda.id);

    await expect(avanzarEstado(deps, ayuda.id, ADMIN)).rejects.toBeInstanceOf(
      TransicionInvalidaError,
    );

    const despues = await deps.ayudas.listarSeguimiento(ayuda.id);
    expect(despues.length).toBe(antes.length);
    const actual = await deps.ayudas.buscarPorId(ayuda.id);
    expect(actual?.estado).toBe(EstadoAyuda.ENTREGADO);
  });

  it("atomicidad: si el repo falla al registrar el evento, el estado no cambia", async () => {
    const { deps, ayuda } = ctx;
    // Doble que simula el fallo del insert del evento sin tocar el estado (la
    // infraestructura real lo garantiza con `prisma.$transaction`). Solo se
    // implementan los métodos que usa `avanzarEstado`.
    const ayudasFalla = {
      buscarPorId: (id: string) => deps.ayudas.buscarPorId(id),
      avanzarConSeguimiento: async () => {
        throw new Error("fallo al insertar el evento");
      },
    } as unknown as typeof deps.ayudas;

    await expect(
      avanzarEstado({ ayudas: ayudasFalla }, ayuda.id, ADMIN),
    ).rejects.toThrow("fallo al insertar el evento");

    const actual = await deps.ayudas.buscarPorId(ayuda.id);
    expect(actual?.estado).toBe(EstadoAyuda.RECOLECTANDO);
  });
});
