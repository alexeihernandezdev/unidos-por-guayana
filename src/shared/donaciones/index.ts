// Fachada de donaciones para la presentación. La app (páginas y server actions)
// importa desde aquí en vez de `@/lib/donaciones`, respetando el límite de capas
// (ui/app no importan `lib` directamente; ESLint lo hace cumplir).
export {
  crearMedioDonacionServicio,
  editarMedioDonacionServicio,
  activarMedioDonacionServicio,
  desactivarMedioDonacionServicio,
  buscarMedioDonacionServicio,
  listarMediosDonacionServicio,
  listarMediosPublicablesServicio,
} from "@/lib/donaciones";
