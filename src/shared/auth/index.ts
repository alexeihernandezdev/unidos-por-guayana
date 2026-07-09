// Fachada de auth para la presentación. La app (route handlers, páginas y server
// actions) importa desde aquí en vez de `@/lib/auth`, respetando el límite de
// capas (ui/app no importan `lib` directamente; ESLint lo hace cumplir).
export {
  auth,
  handlers,
  signIn,
  signOut,
  registrarNuevoUsuario,
} from "@/lib/auth";
export {
  getUsuarioActual,
  requireRol,
  requireSesion,
  type UsuarioSesion,
} from "./session";
