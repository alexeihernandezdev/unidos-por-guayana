// Fachada de actividades para la presentación. La app (páginas y server actions) importa
// desde aquí en vez de `@/lib/actividades`, respetando el límite de capas (ui/app no
// importan `lib` directamente; ESLint lo hace cumplir).
export {
  crearActividadServicio,
  listarActividadesServicio,
  obtenerActividadServicio,
  editarCabeceraServicio,
  guardarMetaServicio,
  quitarMetaServicio,
  avanzarEstadoServicio,
  eliminarActividadServicio,
} from "@/lib/actividades";
