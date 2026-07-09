// Route handler de Auth.js. Re-exporta los handlers GET/POST generados por
// NextAuth (a través de la fachada `@/shared/auth`, para no importar `lib`
// directamente desde `app`).
import { handlers } from "@/shared/auth";

export const { GET, POST } = handlers;
