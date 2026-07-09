import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// En Next.js 16 el antiguo `middleware` se llama `proxy` (misma función, corre en
// el runtime de Node.js). Aquí exige sesión en las rutas protegidas y redirige a
// /login si no hay. El control por rol lo aplica cada página con `requireRol()`.
//
// `auth(...)` envuelve el handler y expone la sesión (JWT, sin tocar la base) en
// `req.auth`.
export default auth((req) => {
  if (!req.auth) {
    const urlLogin = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(urlLogin);
  }
  return NextResponse.next();
});

export const config = {
  // Solo protege /panel (ejemplo). Añade aquí más prefijos según crezcan las
  // features. Auth (/api/auth), estáticos e imágenes quedan fuera por defecto.
  matcher: ["/panel/:path*"],
};
