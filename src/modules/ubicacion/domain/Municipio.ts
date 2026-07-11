// Entidad de dominio del catálogo de ubicación (feature 020). Puro: sin Prisma ni
// framework. Un `Municipio` pertenece a un `Estado` (`estadoId`); el desplegable
// de municipio se filtra por el estado elegido. `codigo` es la clave natural
// estable (`<codigoEstado>-<nn>`).
export type Municipio = {
  id: string;
  codigo: string;
  nombre: string;
  estadoId: string;
};
