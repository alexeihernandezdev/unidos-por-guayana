# 028 · Rediseño del panel administrativo — Tareas

> Checklist de implementación. El orden respeta las dependencias de `plan.md`.
> **Sin dependencias npm nuevas, sin migraciones.**

## 1. Primitivos (`src/shared/ui/panel/`)

- [ ] `PanelPageHeader`: profundidad sutil + icono fantasma decorativo (API intacta).
- [ ] `PANEL_HEADER_ACTION` (primary/secondary sobre banner) exportado del barril.
- [ ] Nuevo `panel-filters.tsx` (`PanelFilters` + `PanelFiltersField`) + export.
- [ ] `PanelBadge`: tonos con tokens semánticos + tono `success` + prop `dot`.
- [ ] `PanelListRow`: prop `detail` + hover refinado.
- [ ] `PanelEmptyState`: variante standalone con borde dashed.

## 2. Secciones

- [ ] Actividades: índice (filtros, vacío, acciones), nueva/editar (`ActividadForm` sin `campo`), detalle.
- [ ] Solicitudes: índice (filtros con `Input` compartido), detalle (`SolicitudAcciones`).
- [ ] Recursos: gestión + tabla + propuestas; acciones de banner legibles (bug «botón blanco»).
- [ ] Donaciones: encabezados de sección, listados, modales, montos `numeric-tnum`.
- [ ] Mi red: chips de categoría tokenizados, filtros, vacío.
- [ ] Perfil / Centros de acopio: armonización menor + nomenclatura.
- [ ] Superadmin: `BandejaAdmins` → row-cards con `detail` + `PanelEmptyState`.
- [ ] Nomenclatura «Centro de Acopio» en literales visibles del alcance.

## 3. Cierre

- [ ] `npm run lint` y `npm run build` en verde.
- [ ] Grep: sin `bg-amber-`, sin constante `campo`, sin «punto de acopio» visible en el alcance.
- [ ] `constitution/ui-guidelines.md` actualizada (filtros, acciones banner, `detail`, badges).
- [ ] `DOC/features/028-rediseno-panel-administrativo.md`.
- [ ] `constitution/roadmap.md` actualizado.
