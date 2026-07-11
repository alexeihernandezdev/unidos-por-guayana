// Fachada de ayudas para la presentación. La app (páginas y server actions) importa
// desde aquí en vez de `@/lib/ayudas`, respetando el límite de capas (ui/app no
// importan `lib` directamente; ESLint lo hace cumplir).
export {
  crearAyudaServicio,
  listarAyudasServicio,
  obtenerAyudaServicio,
  editarCabeceraServicio,
  guardarMetaServicio,
  quitarMetaServicio,
  avanzarEstadoServicio,
  listarSeguimientoServicio,
  listarSeguimientoPublicoServicio,
  eliminarAyudaServicio,
} from "@/lib/ayudas";
