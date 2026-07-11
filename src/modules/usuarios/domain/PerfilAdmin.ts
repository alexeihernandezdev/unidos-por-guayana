// Perfil ampliado de una cuenta `ADMIN` como centro de acopio (feature 016).
// Dominio puro: sin Prisma ni framework. Los valores del enum coinciden con los
// de `prisma/schema.prisma` para mapear sin casts.

export const TipoDocumento = {
  JURIDICO: "JURIDICO",
  NATURAL: "NATURAL",
} as const;

export type TipoDocumento = (typeof TipoDocumento)[keyof typeof TipoDocumento];

export function esTipoDocumentoValido(valor: string): valor is TipoDocumento {
  return valor === TipoDocumento.JURIDICO || valor === TipoDocumento.NATURAL;
}

// Entidad de dominio: extensión uno a uno de `Usuario` (rol `ADMIN`). El campo
// `telefonoEsWhatsApp` se añadió en la feature 017 para saber por qué canal
// puede contactarle un colaborador o el propio SUPERADMIN.
export type PerfilAdmin = {
  id: string;
  usuarioId: string;
  nombreCuenta: string;
  // Ubicación por catálogo (feature 020, sustituye a `estado`/`parroquia` texto).
  estadoId: string;
  municipioId: string;
  telefono: string;
  telefonoEsWhatsApp: boolean;
  correo: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  createdAt: Date;
  updatedAt: Date;
};

// Datos del perfil sin identidad ni marcas de tiempo (los pone la persistencia).
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

// Alta: los datos del perfil más el usuario `ADMIN` al que pertenece.
export type NuevoPerfilAdmin = DatosPerfilAdmin & { usuarioId: string };

// Edición: cualquier subconjunto de los datos (no se cambia el `usuarioId`).
export type CambiosPerfilAdmin = Partial<DatosPerfilAdmin>;

// Validación de correo laxa (forma, no existencia). La verificación real es
// manual al aprobar la cuenta (feature 015); aquí solo se descarta lo obviamente
// inválido.
export function esCorreoValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
}

// Documento válido = tipo reconocido (`JURIDICO` | `NATURAL`) y número no vacío.
export function esDocumentoValido(
  tipoDocumento: string,
  numeroDocumento: string,
): boolean {
  return (
    esTipoDocumentoValido(tipoDocumento) && numeroDocumento.trim().length > 0
  );
}

/**
 * Reglas de dominio del perfil. Devuelve la lista de problemas (vacía si es
 * válido); la aplicación traduce el primero a un error. Puro y testeable.
 */
export function problemasDePerfilAdmin(datos: DatosPerfilAdmin): string[] {
  const problemas: string[] = [];

  if (datos.nombreCuenta.trim().length === 0) {
    problemas.push("Indica el nombre de la cuenta o centro de acopio.");
  }
  // Presencia de la ubicación del catálogo; la coherencia estado↔municipio la
  // valida el caso de uso contra el catálogo (feature 020).
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
 * hereda del `PerfilAdmin` de su administrador. La consume la feature 011 al
 * prellenar la ubicación de un punto; puede sobrescribirse (feature 020).
 */
export function ubicacionPorDefecto(
  perfil: Pick<PerfilAdmin, "estadoId" | "municipioId">,
): { estadoId: string; municipioId: string } {
  return { estadoId: perfil.estadoId, municipioId: perfil.municipioId };
}
