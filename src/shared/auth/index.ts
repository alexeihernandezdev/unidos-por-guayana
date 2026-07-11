// Fachada de auth para la presentación. La app (route handlers, páginas y server
// actions) importa desde aquí en vez de `@/lib/auth`, respetando el límite de
// capas (ui/app no importan `lib` directamente; ESLint lo hace cumplir).
export {
  auth,
  handlers,
  signIn,
  signOut,
  registrarNuevoUsuario,
  declararCategoriasServicio,
  registrarAdministradorConPerfil,
  listarAdminsPendientesGestion,
  aprobarAdminGestion,
  rechazarAdminGestion,
  obtenerPerfilAdminGestion,
  actualizarPerfilAdminGestion,
  actualizarDatosContactoUsuario,
  buscarUsuarioPorId,
} from "@/lib/auth";
export {
  getUsuarioActual,
  requireAdminVerificado,
  requireDatosContactoCompletos,
  requireRol,
  requireSesion,
  type UsuarioSesion,
} from "./session";
