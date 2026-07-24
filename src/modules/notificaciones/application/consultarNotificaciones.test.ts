import { describe, expect, it } from "vitest";
import { TipoNotificacion } from "@/modules/notificaciones/domain/TipoNotificacion";
import {
  contarNoLeidas,
  listarNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
} from "./consultarNotificaciones";
import { NoAutorizadoError } from "./errors";
import { FakeNotificacionRepository } from "./fakes";

async function sembrar() {
  const notificaciones = new FakeNotificacionRepository();
  await notificaciones.crearMuchas([
    {
      usuarioId: "u1",
      tipo: TipoNotificacion.NUEVA_ACTIVIDAD,
      mensaje: "a",
      referenciaTipo: "ACTIVIDAD",
      referenciaId: "act-1",
      claveDedupe: "k1",
    },
    {
      usuarioId: "u1",
      tipo: TipoNotificacion.META_CUMPLIDA,
      mensaje: "b",
      referenciaTipo: "ACTIVIDAD",
      referenciaId: "act-2",
      claveDedupe: "k2",
    },
    {
      usuarioId: "u2",
      tipo: TipoNotificacion.NUEVA_ACTIVIDAD,
      mensaje: "c",
      referenciaTipo: "ACTIVIDAD",
      referenciaId: "act-1",
      claveDedupe: "k1",
    },
  ]);
  return { notificaciones, deps: { notificaciones } };
}

describe("consultarNotificaciones", () => {
  it("lista los avisos del usuario, del más reciente al más antiguo", async () => {
    const { deps } = await sembrar();
    const lista = await listarNotificaciones(deps, "u1");
    expect(lista.map((n) => n.mensaje)).toEqual(["b", "a"]);
  });

  it("cuenta las no leídas del usuario", async () => {
    const { deps } = await sembrar();
    expect(await contarNoLeidas(deps, "u1")).toBe(2);
    expect(await contarNoLeidas(deps, "u2")).toBe(1);
  });

  it("marca una como leída solo si es del dueño", async () => {
    const { deps, notificaciones } = await sembrar();
    const propia = notificaciones.items.find((n) => n.usuarioId === "u1")!;
    await marcarLeida(deps, propia.id, "u1");
    expect(await contarNoLeidas(deps, "u1")).toBe(1);
  });

  it("rechaza marcar como leída una notificación ajena", async () => {
    const { deps, notificaciones } = await sembrar();
    const ajena = notificaciones.items.find((n) => n.usuarioId === "u2")!;
    await expect(marcarLeida(deps, ajena.id, "u1")).rejects.toBeInstanceOf(
      NoAutorizadoError,
    );
    expect(await contarNoLeidas(deps, "u2")).toBe(1);
  });

  it("marca todas como leídas", async () => {
    const { deps } = await sembrar();
    await marcarTodasLeidas(deps, "u1");
    expect(await contarNoLeidas(deps, "u1")).toBe(0);
    expect(await contarNoLeidas(deps, "u2")).toBe(1);
  });
});
