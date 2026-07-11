import type { Metadata } from "next";
import { headers } from "next/headers";
import { EB_Garamond, Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/modules/landing/ui/SiteHeader";
import { getUsuarioActual } from "@/shared/auth";
import { rutaInicioPorRol, VolverAlPanelHeader } from "@/shared/ui/app-shell";
import { Providers } from "./providers";
import "./globals.css";

// Tipografías definidas en tech-stack.md § "Estilo visual / Tipografías":
// EB Garamond (serif display), Geist Sans (UI/cuerpo), Geist Mono (numérico).
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Unidos por la Guaira",
  description:
    "Plataforma para coordinar ayudas, aportes y solicitudes hacia La Guaira.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Chrome de navegación por sesión (feature 021):
  //  - Sin sesión → navbar público global (`SiteHeader`) en toda la app.
  //  - Con sesión → el navbar desaparece. Las rutas de trabajo traen su propio
  //    shell con sidebar (route groups (app)/(admin) y /superadmin); en las
  //    páginas públicas (landing `/` y `/transparencia`) se muestra una banda
  //    mínima "Ir a mi panel" para no dejar al usuario sin salida.
  // La ruta actual llega vía el header `x-pathname` que setea `src/proxy.ts`.
  const usuario = await getUsuarioActual();
  const pathname = (await headers()).get("x-pathname") ?? "";
  const esPaginaPublica =
    pathname === "/" || pathname.startsWith("/transparencia");
  const esRutaAuth = pathname === "/login" || pathname === "/registro";

  return (
    <html
      lang="es"
      style={{ colorScheme: "light" }}
      className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          {!usuario && !esRutaAuth && <SiteHeader />}
          {usuario && esPaginaPublica && (
            <VolverAlPanelHeader rutaPanel={rutaInicioPorRol(usuario.rol)} />
          )}
          {children}
        </Providers>
      </body>
    </html>
  );
}
