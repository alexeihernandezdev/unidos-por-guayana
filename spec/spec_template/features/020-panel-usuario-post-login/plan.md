# 020 · Plan

## Módulo `src/modules/shell`

- `domain/panelInicio.ts` — ruta base por rol.
- `domain/rutasShell.ts` — detectar rutas con sidebar.
- `application/resolverPanelInicio.ts` — ADMIN con verificación fresca.
- `ui/AppShell`, `AppSidebar`, `MobileAppSidebar`, `BackButton`, `SidebarNav`, `navConfig`.

## Integración

- `login/actions.ts` — `destinoPostLogin` antes de `signIn`.
- `app/layout.tsx` — ocultar `SiteHeader` y envolver rutas usuario en `AppShell`.
- `AdminShell` — botón Atrás; `SidebarNav` compartido desde shell.

## Tests

- Vitest en `domain` y `application` del módulo shell.
