import type { PrismaClient } from "../src/generated/prisma/client";
import catalogo from "./data/venezuela-estados-municipios.json";

/** Nombre oficial vigente (el dataset histórico usa «Vargas»). */
const NOMBRE_OFICIAL_ESTADO: Record<string, string> = {
  Vargas: "La Guaira",
};

type EntradaEstado = (typeof catalogo)[number];

/**
 * Siembra el catálogo de estados y municipios de Venezuela (feature 020).
 * Idempotente: upsert por `codigoIso` y por par `(estadoId, nombre)`.
 */
export async function sembrarCatalogoUbicacion(
  prisma: PrismaClient,
): Promise<{ estados: number; municipios: number }> {
  let totalMunicipios = 0;

  for (const entrada of catalogo as EntradaEstado[]) {
    const nombreEstado = NOMBRE_OFICIAL_ESTADO[entrada.estado] ?? entrada.estado;

    const estado = await prisma.estadoVenezuela.upsert({
      where: { codigoIso: entrada.iso_31662 },
      update: {
        nombre: nombreEstado,
        capital: entrada.capital,
        idIne: entrada.id_estado,
      },
      create: {
        codigoIso: entrada.iso_31662,
        idIne: entrada.id_estado,
        nombre: nombreEstado,
        capital: entrada.capital,
      },
    });

    for (const mun of entrada.municipios) {
      await prisma.municipioVenezuela.upsert({
        where: {
          estadoId_nombre: {
            estadoId: estado.id,
            nombre: mun.municipio,
          },
        },
        update: { capital: mun.capital },
        create: {
          nombre: mun.municipio,
          capital: mun.capital,
          estadoId: estado.id,
        },
      });
      totalMunicipios += 1;
    }
  }

  return { estados: catalogo.length, municipios: totalMunicipios };
}
