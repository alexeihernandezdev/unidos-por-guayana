import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Fija la raíz del workspace a este proyecto: hay un package-lock.json en un
  // directorio superior y, sin esto, Next infiere mal la raíz.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase Storage (feature 031): imagen principal de solicitudes servida por
      // URL firmada de lectura. El host es el del proyecto Supabase (<ref>.supabase.co).
      // No se fija `search` porque las URLs firmadas llevan `?token=...`.
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
