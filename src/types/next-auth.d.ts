import type { DefaultSession } from "next-auth";
import type { Rol } from "@/modules/usuarios/domain/Rol";

// Extiende los tipos de Auth.js para incluir el `rol` (y el `id`) del usuario en
// la sesión y en el token JWT. Así la app lee `session.user.rol` con tipos.

declare module "next-auth" {
  interface User {
    rol: Rol;
  }

  interface Session {
    user: {
      id: string;
      rol: Rol;
    } & DefaultSession["user"];
  }
}

// Nota: NO se augmenta el tipo `JWT`. Vive en `@auth/core/jwt`, que no es una
// dependencia directa; bajo el node_modules estricto de pnpm ese módulo no se
// resuelve desde aquí y la augmentación no se fusionaría. En su lugar, la
// callback `session` lee el token con guards de tipo (ver `src/lib/auth.ts`).
