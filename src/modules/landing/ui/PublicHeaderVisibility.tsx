"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PublicHeaderVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const esRutaSinHeader =
    pathname === "/login" || pathname === "/registro" || pathname === "/test";

  return esRutaSinHeader ? null : children;
}
