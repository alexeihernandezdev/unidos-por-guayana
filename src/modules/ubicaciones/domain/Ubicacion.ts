// Entidades del catálogo de ubicaciones de Venezuela (feature 020). Dominio puro.

export type Estado = {
  id: string;
  codigo: string;
  nombre: string;
};

export type Municipio = {
  id: string;
  codigo: string | null;
  nombre: string;
  estadoId: string;
};

export type UbicacionCatalogo = {
  estadoId: string;
  municipioId: string;
};
