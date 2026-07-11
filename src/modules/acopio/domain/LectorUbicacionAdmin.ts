// Puerto pequeño para leer la ubicación (`estadoId`/`municipioId`) del
// `PerfilAdmin` de un administrador, sin acoplar `acopio` a la infraestructura
// de `usuarios`. El caso de uso `crearPuntoAcopio` lo usa para heredar la
// ubicación cuando no se envía en el formulario. Devuelve `null` si el admin
// aún no tiene perfil (el caso de uso lo traduce a `UbicacionVaciaError`).
export interface LectorUbicacionAdmin {
  leerPorAdminId(
    adminId: string,
  ): Promise<{ estadoId: string; municipioId: string } | null>;
}
