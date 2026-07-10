// Catálogo geográfico de Venezuela (feature 020). Dominio puro.

export type Estado = {
  id: string;
  codigoIso: string;
  idIne: number;
  nombre: string;
  capital: string | null;
};

export type Municipio = {
  id: string;
  nombre: string;
  capital: string | null;
  estadoId: string;
};

/** Par estado + municipio seleccionado en un formulario. */
export type UbicacionSeleccion = {
  estadoId: string;
  municipioId: string;
};

export type ResultadoValidacion<T> =
  | { ok: true; valor: T }
  | { ok: false; error: string };

/**
 * Valida que ambos IDs estén presentes (formato mínimo antes de consultar BD).
 */
export function validarUbicacionIds(
  entrada: UbicacionSeleccion,
): ResultadoValidacion<UbicacionSeleccion> {
  const estadoId = entrada.estadoId.trim();
  const municipioId = entrada.municipioId.trim();

  if (estadoId.length === 0) {
    return { ok: false, error: "Indica el estado." };
  }
  if (municipioId.length === 0) {
    return { ok: false, error: "Indica el municipio." };
  }

  return { ok: true, valor: { estadoId, municipioId } };
}

/** Árbol preagrupado para selects en cascada (estado → municipios). */
export type CatalogoUbicacionFormulario = {
  estados: Pick<Estado, "id" | "nombre">[];
  municipiosPorEstado: Record<string, Pick<Municipio, "id" | "nombre">[]>;
};

export function agruparCatalogoParaFormulario(
  estados: Estado[],
  municipios: Municipio[],
): CatalogoUbicacionFormulario {
  const municipiosPorEstado: CatalogoUbicacionFormulario["municipiosPorEstado"] =
    {};

  for (const estado of estados) {
    municipiosPorEstado[estado.id] = [];
  }

  for (const municipio of municipios) {
    const lista = municipiosPorEstado[municipio.estadoId];
    if (lista) {
      lista.push({ id: municipio.id, nombre: municipio.nombre });
    }
  }

  for (const estadoId of Object.keys(municipiosPorEstado)) {
    municipiosPorEstado[estadoId].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es"),
    );
  }

  return {
    estados: estados
      .map((e) => ({ id: e.id, nombre: e.nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
    municipiosPorEstado,
  };
}
