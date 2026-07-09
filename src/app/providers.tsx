"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Providers de cliente que envuelven la app. Vive en la capa de presentación
 * (src/app) porque monta librerías de UI/estado; el dominio no depende de esto.
 *
 * El `QueryClient` se crea con `useState` para tener una única instancia por
 * árbol de render y no compartirla entre peticiones en el servidor.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
