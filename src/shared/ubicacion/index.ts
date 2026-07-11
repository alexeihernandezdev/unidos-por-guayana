// Fachada del catálogo de ubicación para la presentación (feature 020). La app
// (páginas y server components) importa desde aquí en vez de `@/lib/ubicacion`,
// respetando el límite de capas (ui/app no importan `lib` directamente; ESLint lo
// hace cumplir). Los tipos de dominio se re-exportan para tipar los props del
// selector sin que la UI toque infraestructura.
export {
  cargarCatalogoUbicacion,
  listarEstadosUbicacion,
  listarMunicipiosDeEstado,
} from "@/lib/ubicacion";
export type { CatalogoUbicacion } from "@/modules/ubicacion/application/listarCatalogo";
export type { Estado } from "@/modules/ubicacion/domain/Estado";
export type { Municipio } from "@/modules/ubicacion/domain/Municipio";
