import type { Metadata } from "next";
import { headers } from "next/headers";
import { EB_Garamond, Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/modules/landing/ui/SiteHeader";
import { AppShell, esRutaConSidebar, esRutaShellUsuario } from "@/shared/shell";
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
  // El navbar global (SiteHeader) NO se muestra en rutas con sidebar: /panel/*
  // usa `AdminShell`; el resto de paneles por rol usan `AppShell`. La ruta
  // actual llega vía el header `x-pathname` que setea `src/proxy.ts`.
  const pathname = (await headers()).get("x-pathname") ?? "";
  const enPanel = esRutaConSidebar(pathname);
  const enPanelUsuario = esRutaShellUsuario(pathname);

  return (
    <html
      lang="es"
      style={{ colorScheme: "light" }}
      className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          {!enPanel && <SiteHeader />}
          {enPanelUsuario ? <AppShell>{children}</AppShell> : children}
        </Providers>
      </body>
    </html>
  );
}
