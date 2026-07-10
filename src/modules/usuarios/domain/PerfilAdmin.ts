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

// Entidad de dominio: extensión uno a uno de `Usuario` (rol `ADMIN`).
export type PerfilAdmin = {
  id: string;
  usuarioId: string;
  nombreCuenta: string;
  estado: string;
  parroquia: string;
  telefono: string;
  correo: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  createdAt: Date;
  updatedAt: Date;
};

// Datos del perfil sin identidad ni marcas de tiempo (los pone la persistencia).
export type DatosPerfilAdmin = {
  nombreCuenta: string;
  estado: string;
  parroquia: string;
  telefono: string;
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
  if (datos.estado.trim().length === 0) {
    problemas.push("Indica el estado.");
  }
  if (datos.parroquia.trim().length === 0) {
    problemas.push("Indica la parroquia.");
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
 * Ubicación por defecto (`estado`, `parroquia`) que un `PuntoAcopio` nuevo hereda
 * del `PerfilAdmin` de su administrador. La consume la feature 011 al prellenar
 * la ubicación de un punto; puede sobrescribirse.
 */
export function ubicacionPorDefecto(
  perfil: Pick<PerfilAdmin, "estado" | "parroquia">,
): { estado: string; parroquia: string } {
  return { estado: perfil.estado, parroquia: perfil.parroquia };
}
