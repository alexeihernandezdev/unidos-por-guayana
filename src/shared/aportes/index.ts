// Fachada de aportes para la presentación. La app (páginas y server actions)
// importa desde aquí en vez de `@/lib/aportes`, respetando el límite de capas
// (ui/app no importan `lib` directamente; ESLint lo hace cumplir).
export {
  crearAporteServicio,
  cancelarAporteServicio,
  marcarRecibidoServicio,
  revertirRecibidoServicio,
  listarAportesPorAyudaServicio,
  listarAportesDeColaboradorServicio,
  listarAportesRecientesServicio,
  listarAportantesDeAyudaServicio,
  progresoDeAyudaServicio,
} from "@/lib/aportes";
