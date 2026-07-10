// Fachada de recursos para la presentación. La app (páginas y server actions)
// importa desde aquí en vez de `@/lib/recursos`, respetando el límite de capas
// (ui/app no importan `lib` directamente; ESLint lo hace cumplir).
export {
  crearRecursoServicio,
  listarRecursosServicio,
  buscarRecursoServicio,
  editarRecursoServicio,
  archivarRecursoServicio,
  activarRecursoServicio,
  proponerRecursoServicio,
  listarPropuestasServicio,
  aprobarPropuestaServicio,
  rechazarPropuestaServicio,
} from "@/lib/recursos";
