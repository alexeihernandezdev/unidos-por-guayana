import {
  categoriasNoVacias,
  normalizarCategorias,
} from "@/modules/afiliaciones/domain/reglas";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import type { UsuarioRepository } from "@/modules/usuarios/domain/UsuarioRepository";
import { CategoriasAporteVaciasError } from "./errors";

export type DeclararCategoriasDeps = {
  usuarios: UsuarioRepository;
};

/**
 * Reemplaza las categorías de aporte declaradas por un COLABORADOR (feature 025),
 * desde `/mi-perfil`. Normaliza (descarta inválidas y duplicados) y exige al menos
 * una categoría válida. Caso de uso puro.
 */
export async function declararCategorias(
  { usuarios }: DeclararCategoriasDeps,
  colaboradorId: string,
  categorias: readonly string[],
): Promise<Usuario> {
  const normalizadas = normalizarCategorias(categorias);
  if (!categoriasNoVacias(normalizadas)) {
    throw new CategoriasAporteVaciasError();
  }
  return usuarios.actualizarCategoriasAporte(colaboradorId, normalizadas);
}
