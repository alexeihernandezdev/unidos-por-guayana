import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Fija la raíz del workspace a este proyecto: hay un package-lock.json en un
  // directorio superior y, sin esto, Next infiere mal la raíz.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
