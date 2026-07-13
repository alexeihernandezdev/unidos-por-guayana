# 026 · Guía de diseño y layout consistente — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias de `plan.md`. **Sin dependencias npm nuevas.**

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (server/client components, `layout`).
- [ ] Repasar el patrón de referencia: `(admin)/panel/puntos-acopio/page.tsx` y `(admin)/panel/perfil/page.tsx`.
- [ ] Repasar `src/shared/ui/app-shell/app-shell.tsx` (el `<main>` que ya provee) y `tech-stack.md § Estilo visual`.

## 1. Guía de diseño (constitución)

- [ ] Crear `constitution/ui-guidelines.md` con: contenedor (ancho por `size`, padding, `gap`), escala tipográfica de página (tamaño/peso/familia), anatomía de los dos encabezados, **presentación de listados (row-cards)**, cuándo usar cada uno y la regla de "un solo `<main>`".
- [ ] Referenciar `ui-guidelines.md` desde `tech-stack.md § Estilo visual`.

## 2. Componentes compartidos

- [ ] `src/shared/ui/panel/panel-page.tsx` → `PanelPage({ size, className?, children })` + mapa puro `PANEL_MAX_W`.
- [ ] `src/shared/ui/panel/panel-page-header.tsx` → `PanelPageHeader({ icon, eyebrow, title, description?, actions? })` (banner).
- [ ] `src/shared/ui/panel/panel-page-sub-header.tsx` → `PanelPageSubHeader({ title, backHref?, backLabel?, description?, actions? })` (ligero).
- [ ] `src/shared/ui/panel/panel-list.tsx` → `PanelList` (contenedor) + `PanelListToolbar` (barra conteo + acción).
- [ ] `src/shared/ui/panel/panel-list-row.tsx` → `PanelListRow({ icon, title, badge?, secondary?, meta?, actions? })` (row-card).
- [ ] `src/shared/ui/panel/panel-empty-state.tsx` → `PanelEmptyState({ icon, title, description, action? })`.
- [ ] _(Opcional)_ `panel-section-tabs.tsx` para la sub-nav Perfil/Puntos de acopio.
- [ ] Barril `src/shared/ui/panel/index.ts` (componentes + `PANEL_MAX_W`).
- [ ] Refactorizar `PuntosAcopioGestion` para consumir `PanelList`/`PanelListRow`/`PanelListToolbar`/`PanelEmptyState` **sin cambio visible** (valida la abstracción contra su origen).

## 3. Página piloto

- [ ] Migrar `(admin)/panel/recursos/page.tsx` (índice → `PanelPage` + `PanelPageHeader`).
- [ ] Convertir `RecursosTabla` a row-cards (`PanelList`/`PanelListRow`), conservando datos y acciones.
- [ ] Migrar `(admin)/panel/recursos/nuevo/page.tsx` (subpágina → `PanelPage` + `PanelPageSubHeader`).
- [ ] Revisar a ojo desktop + móvil; ajustar componentes si hace falta.

## 4. Propagar — `(admin)/panel/*`

- [ ] Dashboard `/panel`: envolver en `PanelPage` y reconciliar `DispatchStrip` con el banner (ver `plan.md §5`).
- [ ] Actividades: `page` (índice) + `nueva` / `[id]` / `[id]/editar` (subpáginas).
- [ ] Recursos: `[id]/editar`, `propuestas` (subpáginas; el índice y `nuevo` ya en §3).
- [ ] Solicitudes: `page` (índice) + `[id]` (subpágina).
- [ ] Donaciones: `page` (índice) + `nuevo` / `[id]/editar` / `ingresos/nuevo` (subpáginas).
- [ ] Red: `page` (índice, `size="wide"`).
- [ ] Perfil: mover banner inline a `PanelPageHeader` (+ `PanelSectionTabs` si se creó).
- [ ] Puntos de acopio: mover banner inline a `PanelPageHeader` (`size="wide"`) (+ tabs).

## 5. Propagar — `/superadmin`

- [ ] `superadmin/admins/page.tsx` (índice → banner).

## 6. Propagar — `(app)/*`

- [ ] Actividades: `page` (índice) + `[id]` / `[id]/aportar` (subpáginas).
- [ ] Mis aportes: `page` (índice).
- [ ] Puntos de acopio: `page` (índice, `wide`) + `[id]` (subpágina).
- [ ] Mi perfil: `page` (índice).
- [ ] Solicitudes: `page` (índice) + `nueva` / `proponer-recurso` / `[id]` / `[id]/editar` (subpáginas).

## 6b. Conversión de listados a row-cards (§5b del plan)

- [ ] `ActividadesTabla` (admin + app).
- [ ] `SolicitudesTabla` (admin + app).
- [ ] `PropuestasTabla` (admin Recursos › propuestas).
- [ ] `AportesTabla` (Mis aportes / detalle) — montos en `font-mono`.
- [ ] `AportantesTabla` (detalle Actividad, solo lectura).
- [ ] `MediosDonacionTabla` e `IngresosMonetariosTabla` (admin Donaciones) — montos en `font-mono`, layout semitabular en desktop.
- [ ] `RedTabla` (admin Red) — alinear al patrón (verificar si ya es card-like).
- [ ] Tablas inline de `mis-aportes` y `solicitudes/[id]` (admin/app) → row-cards.
- [ ] Revisar `ProgresoMetas`: conservar si es display de progreso, no un listado tabular.
- [ ] Barras-resumen a `PanelListToolbar` y estados vacíos a `PanelEmptyState` en todos los listados.

## 7. Limpieza

- [ ] Confirmar que **ningún** `page.tsx` del espacio logeado repite `mx-auto flex w-full max-w-… p-… gap-…` a mano (grep).
- [ ] Confirmar **un solo** `<main>` por documento (el de `AppShell`); ninguna página anida otro.
- [ ] Confirmar que **ningún** listado del espacio logeado usa ya `<table>` (grep), salvo `ProgresoMetas` si se justifica.
- [ ] Quedan sin tocar landing, `/transparencia`, `(auth)/*`, `/completar-perfil`, `/cuenta-admin` (incluidas sus tablas públicas).

## 8. Tests (Vitest)

- [ ] `PANEL_MAX_W` / `size → max-w` (tres casos) en verde.
- [ ] _(Opcional)_ smoke de `PanelPageHeader` / `PanelPageSubHeader` si RTL está configurado.
- [ ] Suite completa en verde.

## 9. Validación final

- [ ] `pnpm test` en verde.
- [ ] `pnpm exec eslint src` sin errores (kebab-case en `src/shared/ui`).
- [ ] `pnpm build` sin errores.
- [ ] `pnpm dev` — recorrido por rol (`ADMIN`, `SUPERADMIN`, `COLABORADOR`, `SOLICITANTE`): padding/ancho/encabezado uniformes, índices con banner, subpáginas ligeras, un solo `<main>`, desktop + móvil.

## 10. Cierre

- [ ] Los componentes nuevos no introducen imports de `infrastructure` en `ui`.
- [ ] `DOC/features/026-guia-de-diseno-y-layout-consistente.md` generado.
- [ ] `026` movido a **Hecho ✅** en `constitution/roadmap.md`.
