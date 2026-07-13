# 027 · Modal genérico y scrollbar global — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias de `plan.md`. **Sin dependencias npm nuevas.**

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (client components, dynamic).
- [ ] Repasar el patrón de referencia: `PuntosAcopioGestion.tsx` (estado `modal`, `cerrarYRefrescar`).
- [ ] Repasar formularios a migrar: `RecursoForm`, `MedioDonacionForm`, `RegistroIngresoForm`.

## 1. Scrollbar global

- [ ] Añadir estilos de scrollbar en `src/app/globals.css` (Firefox + WebKit, sin flechas).
- [ ] Documentar en `constitution/ui-guidelines.md` (sección "Scrollbar global").
- [ ] Verificar visualmente en Windows (Chrome/Edge) que no aparecen flechas.

## 2. Componente `<PanelFormModal>`

- [ ] Crear `src/shared/ui/panel/panel-form-modal.tsx` con API de `plan.md §3`.
- [ ] Exportar desde `src/shared/ui/panel/index.ts`.
- [ ] _(Opcional)_ Test Vitest de mapa `size → max-w` si se extrae constante pura.

## 3. Piloto — Puntos de acopio

- [ ] Refactorizar `PuntosAcopioGestion` para usar `<PanelFormModal size="wide">`.
- [ ] Revisar a ojo desktop + móvil (bordes más redondos, scroll, cerrar/guardar).

## 4. Recursos

- [ ] Añadir `onExito?` a `RecursoForm` (patrón `PuntoAcopioForm`).
- [ ] Crear o extender componente de gestión con modal (nuevo + editar).
- [ ] Actualizar `(admin)/panel/recursos/page.tsx` (props + gestor).
- [ ] Cambiar `RecursosTabla`: "Editar" abre modal (callback), no `Link`.
- [ ] Eliminar `recursos/nuevo/page.tsx` y `recursos/[id]/editar/page.tsx`.
- [ ] Actualizar `AccesosDirectos` y `PropuestasTabla` si enlazan a rutas eliminadas.

## 5. Donaciones

- [ ] Añadir `onExito?` a `MedioDonacionForm` y `RegistroIngresoForm`.
- [ ] Crear `DonacionesGestion` (o equivalente) con modales: medio nuevo, medio editar, ingreso.
- [ ] Mover precarga de datos de `ingresos/nuevo` al `page.tsx` índice de donaciones.
- [ ] Actualizar `MediosDonacionTabla` y toolbar de la página índice.
- [ ] Eliminar `donaciones/nuevo`, `donaciones/[id]/editar`, `donaciones/ingresos/nuevo`.

## 6. Limpieza

- [ ] Grep de rutas eliminadas (`/panel/recursos/nuevo`, `/editar`, `/donaciones/nuevo`, etc.).
- [ ] Confirmar que no quedan `Link` ni `router.push` a subpáginas migradas.
- [ ] Confirmar cierre de modal + `router.refresh()` tras guardar en todos los flujos.

## 7. Validación

- [ ] `pnpm test` en verde.
- [ ] `pnpm exec eslint src` sin errores.
- [ ] `pnpm build` sin errores.
- [ ] Validación a ojo `ADMIN`: recursos, donaciones (medios + ingreso), puntos de acopio.
- [ ] Scrollbar global visible en listados largos (sin flechas en Windows).
