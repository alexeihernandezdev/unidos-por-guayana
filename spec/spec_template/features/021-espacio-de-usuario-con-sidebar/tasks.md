# 021 · Espacio del usuario logeado (sidebar) y navbar solo público — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`. **Sin dependencias npm nuevas.**

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (layouts, route groups, server components).
- [ ] Repasar el shell de admin (008): `src/modules/admin/ui/{Sidebar,SidebarNav,MobileSidebar,AdminShell,navConfig}.tsx`.
- [ ] Repasar `src/modules/landing/ui/navConfig.ts` (`navItemsPorRol`) y `src/app/layout.tsx` (condición actual del navbar).
- [ ] Levantar la base y sembrar usuarios de cada rol (`db:seed`).

## 1. Generalizar el shell con sidebar

- [ ] Crear el shell genérico (recomendado `src/shared/ui/app-shell/`):
      - `AppShell({ secciones, homeHref, ariaLabel, children })` (server component; lee `getUsuarioActual`).
      - `AppSidebar({ secciones, homeHref, ariaLabel, usuario })` (sin `ADMIN_NAV`/`/panel` hardcodeados).
      - Mover/reexportar `SidebarNav` y `MobileSidebar` parametrizados.
- [ ] Ampliar `IconoNav` + mapa `ICONOS` (lucide) con los iconos que falten (aportes, solicitudes, nueva, proponer, perfil…).
- [ ] Convertir `AdminShell` en wrapper delgado sobre `AppShell` con la config de admin; **verificar que el panel de admin se ve igual**.

## 2. Config de navegación por rol

- [ ] `navSectionsPorRol(rol)` con las secciones de `ADMIN`, `SUPERADMIN`, `COLABORADOR`, `SOLICITANTE` (ver `plan.md` §3).
- [ ] Hacer que los destinos coincidan con `navItemsPorRol` (landing); reutilizar o derivar para no divergir.
- [ ] `rutaInicioPorRol(rol)` con los destinos por rol.
- [ ] Test unitario de `navSectionsPorRol` y `rutaInicioPorRol`.

## 3. Route group + layout del espacio de usuario

- [ ] Crear `src/app/(app)/layout.tsx` que exige rol no-admin (`requireRol(COLABORADOR, SOLICITANTE)`) y renderiza `AppShell` con `navSectionsPorRol(usuario.rol)`.
- [ ] Mover al grupo **sin cambiar URLs**:
      - `src/app/ayudas/**` → `src/app/(app)/ayudas/**`.
      - `src/app/mis-aportes/**` → `src/app/(app)/mis-aportes/**`.
      - `src/app/mi-perfil/**` → `src/app/(app)/mi-perfil/**`.
- [ ] Revisar/reapuntar imports de server actions afectados (p. ej. `src/app/aportes/actions.ts`).
- [ ] Confirmar que `proxy.ts` sigue cubriendo los prefijos protegidos (no cambian las URLs).

## 4. Navbar condicionado a sesión

- [ ] En `src/app/layout.tsx`, mostrar `SiteHeader` **solo** cuando no hay usuario en sesión (`getUsuarioActual`).
- [ ] Revisar si `x-pathname` sigue siendo necesario; si nada lo usa, simplificar (sin romper `proxy.ts`).

## 5. Layout del SUPERADMIN

- [ ] Actualizar `src/app/superadmin/layout.tsx` para usar `AppShell` con la sección "Aprobaciones".
- [ ] Verificar que `SUPERADMIN` navega a `/superadmin/admins` desde el sidebar (ya sin navbar).

## 6. Despacho post-login + affordance

- [ ] Ruta despachadora `/inicio` (server component) que redirige con `rutaInicioPorRol(rol)`.
- [ ] `iniciarSesionAction` (`src/app/(auth)/login/actions.ts`): `redirectTo: "/inicio"`.
- [ ] Affordance "Ir a mi panel" en páginas públicas (`/`, `/transparencia`) visible solo con sesión.
- [ ] Onboarding (`/completar-perfil`, `/cuenta-admin`, `/(auth)/*`) se muestra sin sidebar, con "Cerrar sesión" donde aplique.

## 7. Tests (Vitest)

- [ ] `rutaInicioPorRol` — destino correcto por rol.
- [ ] `navSectionsPorRol` — secciones/ítems correctos por rol.
- [ ] Todos en verde.

## 8. Validación final

- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` (`pnpm exec eslint src`) / `pnpm build` sin errores.
- [ ] `pnpm dev`, por cada rol (ver `plan.md` §Validación):
      - [ ] `COLABORADOR`: login → `/ayudas`; sidebar correcto; móvil ok; sin navbar.
      - [ ] `SOLICITANTE`: login → `/solicitudes`; sidebar correcto; móvil ok; sin navbar.
      - [ ] `ADMIN`: panel idéntico a antes; login → `/panel`.
      - [ ] `SUPERADMIN`: login → `/superadmin/admins`; sidebar con "Aprobaciones".
      - [ ] Sin sesión: navbar presente en `/` y `/transparencia`; login/registro sin sidebar.
      - [ ] Logeado en `/` y `/transparencia`: sin navbar, con affordance "Ir a mi panel".

## 9. Cierre

- [ ] Verificar que el shell reutilizado no introduce imports de `infrastructure` en `ui`.
- [ ] Generar/actualizar `DOC/features/021-espacio-de-usuario-con-sidebar.md`.
- [ ] Mover `021` a **Hecho ✅** en `constitution/roadmap.md`.
