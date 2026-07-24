import * as React from "react"

const MOBILE_BREAKPOINT = 768
const CONSULTA = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

// `useSyncExternalStore` en vez de setState-en-effect: da un snapshot de servidor
// estable (no-móvil) y evita el error `set-state-in-effect` del ESLint del
// proyecto (mismo patrón que `usePrefersReducedMotion`).
function suscribir(alCambiar: () => void): () => void {
  const mql = window.matchMedia(CONSULTA)
  mql.addEventListener("change", alCambiar)
  return () => mql.removeEventListener("change", alCambiar)
}

export function useIsMobile(): boolean {
  return React.useSyncExternalStore(
    suscribir,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false,
  )
}
