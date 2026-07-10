// Perfil ampliado de una cuenta `ADMIN` como centro de acopio (feature 016).
// Dominio puro: sin Prisma ni framework. Los valores del enum coinciden con los
// de `prisma/schema.prisma` para mapear sin casts. Ubicación por catálogo (020).

export const TipoDocumento = {
  JURIDICO: "JURIDICO",
  NATURAL: "NATURAL",
} as const;

export type TipoDocumento = (typeof TipoDocumento)[keyof typeof TipoDocumento];

export function esTipoDocumentoValido(valor: string): valor is TipoDocumento {
  return valor === TipoDocumento.JURIDICO || valor === TipoDocumento.NATURAL;
}

export type PerfilAdmin = {
  id: string;
  usuarioId: string;
  nombreCuenta: string;
  estadoId: string | null;
  municipioId: string | null;
  telefono: string;
  telefonoEsWhatsApp: boolean;
  correo: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DatosPerfilAdmin = {
  nombreCuenta: string;
  estadoId: string;
  municipioId: string;
  telefono: string;
  telefonoEsWhatsApp: boolean;
  correo: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
};

export type NuevoPerfilAdmin = DatosPerfilAdmin & { usuarioId: string };

export type CambiosPerfilAdmin = Partial<DatosPerfilAdmin>;

export function esCorreoValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
}

export function esDocumentoValido(
  tipoDocumento: string,
  numeroDocumento: string,
): boolean {
  return (
    esTipoDocumentoValido(tipoDocumento) && numeroDocumento.trim().length > 0
  );
}

/**
 * Reglas de dominio del perfil (sin pertenencia al catálogo: eso va en el
 * caso de uso con el repositorio de ubicaciones). Devuelve la lista de
 * problemas (vacía si es válido).
 */
export function problemasDePerfilAdmin(datos: DatosPerfilAdmin): string[] {
  const problemas: string[] = [];

  if (datos.nombreCuenta.trim().length === 0) {
    problemas.push("Indica el nombre de la cuenta o centro de acopio.");
  }
  if (datos.estadoId.trim().length === 0) {
    problemas.push("Selecciona el estado.");
  }
  if (datos.municipioId.trim().length === 0) {
    problemas.push("Selecciona el municipio.");
  }
  if (datos.telefono.trim().length === 0) {
    problemas.push("Indica un teléfono de contacto.");
  }
  if (!esCorreoValido(datos.correo)) {
    problemas.push("Indica un correo de contacto válido.");
  }
  if (!esDocumentoValido(datos.tipoDocumento, datos.numeroDocumento)) {
    problemas.push(
      "El documento requiere un tipo (jurídico o natural) y un número.",
    );
  }

  return problemas;
}

/**
 * Ubicación por defecto (`estadoId`, `municipioId`) que un `PuntoAcopio` nuevo
 * hereda del `PerfilAdmin`. La consume la feature 011.
 */
export function ubicacionPorDefecto(
  perfil: Pick<PerfilAdmin, "estadoId" | "municipioId">,
): { estadoId: string | null; municipioId: string | null } {
  return { estadoId: perfil.estadoId, municipioId: perfil.municipioId };
}
