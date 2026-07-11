// Centro inicial del mapa al crear un punto de acopio (feature 011): la capital
// del estado del `PerfilAdmin` del administrador. Es un dato de presentación
// (no se persiste en el punto); el puerto existe para que la página lo lea sin
// acoplarse a Prisma. Devuelve `null` si el admin no tiene perfil/ubicación o
// su estado no tiene capital sembrada — el mapa cae al centro de Venezuela.
export type CentroMapa = {
  latitud: string;
  longitud: string;
};

export interface LectorCentroMapa {
  centroPorAdminId(adminId: string): Promise<CentroMapa | null>;
}
