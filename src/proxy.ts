import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// En Next.js 16 el antiguo `middleware` se llama `proxy` (misma función, corre en
// el runtime de Node.js). Aquí:
//  1. Exponemos `x-pathname` como header de request para que el root layout pueda
//     decidir qué chrome renderizar (SiteHeader vs. shell del panel).
//  2. En rutas protegidas exigimos sesión y redirigimos a /login si no hay.
//     El control por rol lo aplica cada segmento con `requireRol()`.
//
// `auth(...)` envuelve el handler y expone la sesión (JWT, sin tocar la base) en
// `req.auth`.
export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  // Rutas protegidas (deben coincidir con `config.matcher` de más abajo).
  const requiereSesion =
    pathname.startsWith("/panel") ||
    pathname === "/mis-aportes" ||
    pathname.startsWith("/solicitudes") ||
    pathname === "/ayudas" ||
    /^\/ayudas\/[^/]+/.test(pathname);

  if (requiereSesion && !req.auth) {
    const urlLogin = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(urlLogin);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  // Corre en todas las rutas (menos assets/API/estáticos) para poder inyectar
  // `x-pathname`. El chequeo de sesión se aplica selectivamente arriba.
  matcher: [
    // Todo excepto rutas Next internas, API de auth y estáticos.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)",
  ],
};
