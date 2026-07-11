// Fachada de afiliaciones para la presentación (feature 025). La app (páginas y
// server actions) importa desde aquí en vez de `@/lib/afiliaciones`, respetando el
// límite de capas (ui/app no importan `lib` directamente; ESLint lo hace cumplir).
export {
  afiliarseACentroServicio,
  dejarCentroServicio,
  removerDeRedServicio,
  listarMiRedServicio,
  contarAptosPorCategoriaServicio,
  listarCentrosDisponiblesServicio,
  listarDestinatariosConvocatoriaServicio,
} from "@/lib/afiliaciones";
export type { CentroConAfiliacion } from "@/modules/afiliaciones/application/consultarRed";
export type {
  Afiliacion,
  CentroDisponible,
  MiembroRed,
  PuntoDeCentro,
} from "@/modules/afiliaciones/domain/Afiliacion";
export type { ConteoPorCategoria } from "@/modules/afiliaciones/domain/AfiliacionRepository";
