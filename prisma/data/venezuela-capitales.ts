// Coordenadas de la capital de cada entidad federal (feature 011). Se usan como
// centro inicial del mapa al crear un punto de acopio: el admin ve su ciudad en
// vez de Venezuela entera. Clave: `Estado.codigo` (ISO 3166-2:VE), igual que en
// `venezuela-ubicacion.ts`. Valores con 4 decimales (~11 m), suficientes para
// centrar un mapa; fuente OpenStreetMap.

export type CapitalEstado = {
  /** `Estado.codigo` (ISO 3166-2:VE) al que pertenece la capital. */
  codigoEstado: string;
  capital: string;
  latitud: string;
  longitud: string;
};

export const CAPITALES_VENEZUELA: CapitalEstado[] = [
  { codigoEstado: "VE-A", capital: "Caracas", latitud: "10.4806", longitud: "-66.9036" },
  { codigoEstado: "VE-Z", capital: "Puerto Ayacucho", latitud: "5.6631", longitud: "-67.6264" },
  { codigoEstado: "VE-B", capital: "Barcelona", latitud: "10.1364", longitud: "-64.6862" },
  { codigoEstado: "VE-C", capital: "San Fernando de Apure", latitud: "7.8939", longitud: "-67.4739" },
  { codigoEstado: "VE-D", capital: "Maracay", latitud: "10.2469", longitud: "-67.5958" },
  { codigoEstado: "VE-E", capital: "Barinas", latitud: "8.6226", longitud: "-70.2075" },
  { codigoEstado: "VE-F", capital: "Ciudad Bolívar", latitud: "8.1219", longitud: "-63.5497" },
  { codigoEstado: "VE-G", capital: "Valencia", latitud: "10.1620", longitud: "-68.0077" },
  { codigoEstado: "VE-H", capital: "San Carlos", latitud: "9.6611", longitud: "-68.5828" },
  { codigoEstado: "VE-Y", capital: "Tucupita", latitud: "9.0575", longitud: "-62.0452" },
  { codigoEstado: "VE-I", capital: "Coro", latitud: "11.4045", longitud: "-69.6734" },
  { codigoEstado: "VE-J", capital: "San Juan de los Morros", latitud: "9.9113", longitud: "-67.3536" },
  { codigoEstado: "VE-K", capital: "Barquisimeto", latitud: "10.0678", longitud: "-69.3467" },
  { codigoEstado: "VE-L", capital: "Mérida", latitud: "8.5897", longitud: "-71.1561" },
  { codigoEstado: "VE-M", capital: "Los Teques", latitud: "10.3447", longitud: "-67.0428" },
  { codigoEstado: "VE-N", capital: "Maturín", latitud: "9.7457", longitud: "-63.1832" },
  { codigoEstado: "VE-O", capital: "La Asunción", latitud: "11.0333", longitud: "-63.8628" },
  { codigoEstado: "VE-P", capital: "Guanare", latitud: "9.0418", longitud: "-69.7421" },
  { codigoEstado: "VE-R", capital: "Cumaná", latitud: "10.4581", longitud: "-64.1675" },
  { codigoEstado: "VE-S", capital: "San Cristóbal", latitud: "7.7669", longitud: "-72.2250" },
  { codigoEstado: "VE-T", capital: "Trujillo", latitud: "9.3667", longitud: "-70.4367" },
  { codigoEstado: "VE-X", capital: "La Guaira", latitud: "10.6013", longitud: "-66.9331" },
  { codigoEstado: "VE-U", capital: "San Felipe", latitud: "10.3399", longitud: "-68.7425" },
  { codigoEstado: "VE-V", capital: "Maracaibo", latitud: "10.6427", longitud: "-71.6125" },
];
