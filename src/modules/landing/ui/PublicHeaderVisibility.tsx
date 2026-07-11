"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PublicHeaderVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const esRutaAuth = pathname === "/login" || pathname === "/registro";

  return esRutaAuth ? null : children;
}
