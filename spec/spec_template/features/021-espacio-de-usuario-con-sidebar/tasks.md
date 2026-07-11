# 021 · Espacio del usuario logeado (sidebar) y navbar solo público — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`. **Sin dependencias npm nuevas.**

## 0. Preparación

- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (layouts, route groups, server components).
- [x] Repasar el shell de admin (008): `Sidebar`, `SidebarNav`, `MobileSidebar`, `AdminShell`, `navConfig`.
- [x] Repasar `src/modules/landing/ui/navConfig.ts` (`navItemsPorRol`) y `src/app/layout.tsx` (condición del navbar).
- [x] Instalar dependencias (`pnpm install`) y sembrar usuarios de cada rol (`db:seed`). _(La BD/seed la gestiona el operador; ver AGENTS.md.)_

## 1. Generalizar el shell con sidebar

- [x] Shell genérico en `src/shared/ui/app-shell/`:
      - `app-shell.tsx` (`AppShell`, server; lee `getUsuarioActual`).
      - `app-sidebar.tsx` (`AppSidebar`, sin `ADMIN_NAV`/`/panel` hardcodeados).
      - `app-sidebar-nav.tsx` (`AppSidebarNav`, client) y `app-mobile-sidebar.tsx` (`AppMobileSidebar`, client), parametrizados.
- [x] Ampliar `IconoNav` + mapa `ICONOS` (lucide) con los iconos nuevos (actividades, aportes, solicitudes, nueva, proponer, perfil, aprobaciones…).
- [x] `(admin)/layout.tsx` pasa a usar `AppShell` con la config de admin; se eliminan los componentes viejos de `src/modules/admin/ui` (queda solo `DispatchStrip`). El panel de admin conserva su aspecto (mismas clases).

## 2. Config de navegación por rol

- [x] `navSectionsPorRol(rol)` con las secciones de `ADMIN`, `SUPERADMIN`, `COLABORADOR`, `SOLICITANTE`.
- [x] Destinos alineados con `navItemsPorRol` (landing).
- [x] `rutaInicioPorRol(rol)` con los destinos por rol.
- [x] Test unitario de `navSectionsPorRol` y `rutaInicioPorRol` (`navConfig.test.ts`, 7 casos en verde).

## 3. Route group + layout del espacio de usuario

- [x] `src/app/(app)/layout.tsx` exige sesión (`requireSesion`) y renderiza `AppShell` con `navSectionsPorRol(usuario.rol)`; la autorización fina la mantienen las páginas.
- [x] Mover al grupo **sin cambiar URLs**: `ayudas`, `mis-aportes`, `mi-perfil` → `src/app/(app)/…` (`solicitudes` ya estaba).
- [x] Reapuntar el import roto de `mi-perfil` a `@/app/completar-perfil/actions` (alias absoluto).
- [x] Confirmar que `proxy.ts` sigue cubriendo los prefijos protegidos (no cambian las URLs).

## 4. Navbar condicionado a sesión

- [x] En `src/app/layout.tsx`, mostrar `SiteHeader` **solo** sin sesión; con sesión, banda "Ir a mi panel" solo en páginas públicas (`/`, `/transparencia`).

## 5. Layout del SUPERADMIN

- [x] `src/app/superadmin/layout.tsx` usa `AppShell` con la sección "Aprobaciones", conservando el contenedor centrado del contenido.

## 6. Despacho post-login + affordance

- [x] Ruta despachadora `/inicio` (server) que redirige con `rutaInicioPorRol(rol)`.
- [x] `iniciarSesionAction`: `redirectTo: "/inicio"`.
- [x] `VolverAlPanelHeader` (banda "Ir a mi panel" + cerrar sesión) en páginas públicas con sesión.
- [x] `completar-perfil` gana botón "Cerrar sesión" (sin navbar) y `destinoOk="/inicio"`; `cuenta-admin` ya tenía salida.

## 7. Tests (Vitest)

- [x] `rutaInicioPorRol` — destino correcto por rol.
- [x] `navSectionsPorRol` — secciones/ítems correctos por rol.
- [x] Suite completa en verde (229 tests).

## 8. Validación final

- [x] `pnpm test` en verde (229 passed).
- [x] `pnpm exec eslint` de los archivos tocados: sin errores ni warnings (nombres kebab-case en `src/shared/ui`).
- [x] `tsc --noEmit`: **cero errores atribuibles a esta feature**. Los 35 errores restantes son del refactor en curso de la **020** (`estado`/`parroquia` → `estadoId`/`municipioId`) y de sus tests; ajenos a 021.
- [ ] `pnpm build` completo: bloqueado por los errores de tipo de la **020** (en curso en el mismo árbol). Validar cuando 020 cierre.
- [ ] `pnpm dev` (validación a ojo por rol): pendiente de ejecutar en navegador por el operador.
      - [ ] `COLABORADOR`: login → `/ayudas`; sidebar correcto; móvil ok; sin navbar.
      - [ ] `SOLICITANTE`: login → `/solicitudes`; sidebar correcto; móvil ok; sin navbar.
      - [ ] `ADMIN`: panel idéntico a antes; login → `/panel`.
      - [ ] `SUPERADMIN`: login → `/superadmin/admins`; sidebar con "Aprobaciones".
      - [ ] Sin sesión: navbar en `/` y `/transparencia`; login/registro sin sidebar.
      - [ ] Logeado en `/` y `/transparencia`: sin navbar, con banda "Ir a mi panel".

## 9. Cierre

- [x] El shell reutilizado no introduce imports de `infrastructure` en `ui`.
- [x] `DOC/features/021-espacio-de-usuario-con-sidebar.md` generado.
- [x] `021` movido a **Hecho ✅** en `constitution/roadmap.md`.
