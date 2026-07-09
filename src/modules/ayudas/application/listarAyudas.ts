import type { Ayuda } from "@/modules/ayudas/domain/Ayuda";
import type { FiltroAyudas } from "@/modules/ayudas/domain/AyudaRepository";
import type { AyudaDeps } from "./deps";

/**
 * Lista los envíos, opcionalmente filtrados por estado. Sin filtro devuelve todos
 * (para el listado de gestión del `ADMIN`).
 */
export async function listarAyudas(
  { ayudas }: Pick<AyudaDeps, "ayudas">,
  filtro?: FiltroAyudas,
): Promise<Ayuda[]> {
  return ayudas.listar(filtro);
}
