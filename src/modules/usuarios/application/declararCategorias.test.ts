import { beforeEach, describe, expect, it } from "vitest";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { declararCategorias } from "./declararCategorias";
import { CategoriasAporteVaciasError } from "./errors";
import { InMemoryUsuarioRepository } from "./fakes";

describe("declararCategorias", () => {
  let usuarios: InMemoryUsuarioRepository;
  let colaboradorId: string;

  beforeEach(async () => {
    usuarios = new InMemoryUsuarioRepository();
    const usuario = await usuarios.crear({
      email: "col@example.com",
      nombre: "Col",
      passwordHash: "x",
      rol: Rol.COLABORADOR,
    });
    colaboradorId = usuario.id;
  });

  it("normaliza (descarta inválidas/duplicados) y persiste", async () => {
    const usuario = await declararCategorias({ usuarios }, colaboradorId, [
      "PERSONAL",
      "PERSONAL",
      "NADA",
      "TRANSPORTE",
    ]);
    expect(usuario.categoriasAporte).toEqual(["TRANSPORTE", "PERSONAL"]);
  });

  it("rechaza si no queda ninguna categoría válida", async () => {
    await expect(
      declararCategorias({ usuarios }, colaboradorId, ["NADA", ""]),
    ).rejects.toBeInstanceOf(CategoriasAporteVaciasError);
  });
});
