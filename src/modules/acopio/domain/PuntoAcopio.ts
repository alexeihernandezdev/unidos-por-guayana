// Entidad de dominio. Un `PuntoAcopio` es una ubicación física de un `ADMIN`
// (feature 011). No declara "qué recibe": los aportes se hacen a Ayudas, no a
// puntos. `latitud`/`longitud` se guardan como strings (Prisma serializa
// `Decimal` así) y se validan con `esCoordenadaLatitud`/`esCoordenadaLongitud`.
export type PuntoAcopio = {
  id: string;
  adminId: string;
  nombre: string;
  referencia: string;
  latitud: string;
  longitud: string;
  horarios: string;
  telefono: string;
  telefonoEsWhatsApp: boolean;
  correo: string | null;
  estadoId: string;
  municipioId: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Alta. `adminId` lo fija el caso de uso desde la sesión. `estadoId`/`municipioId`
// pueden venir vacíos: el caso de uso los hereda del `PerfilAdmin`. `activo` nace
// en `true` por defecto (schema). `telefonoEsWhatsApp` por defecto `true`.
export type NuevoPuntoAcopio = {
  adminId: string;
  nombre: string;
  referencia: string;
  latitud: string;
  longitud: string;
  horarios: string;
  telefono: string;
  telefonoEsWhatsApp: boolean;
  correo: string | null;
  estadoId: string;
  municipioId: string;
};

// Cambios en edición. `adminId` es inmutable (dueño). `activo` se alterna por
// archivar/activar, no por edición general.
export type CambiosPuntoAcopio = Partial<{
  nombre: string;
  referencia: string;
  latitud: string;
  longitud: string;
  horarios: string;
  telefono: string;
  telefonoEsWhatsApp: boolean;
  correo: string | null;
  estadoId: string;
  municipioId: string;
}>;
