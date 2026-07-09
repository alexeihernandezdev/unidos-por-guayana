# 008 · Panel de administración — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (server components, `revalidate`,
      `Link`) y repasar los módulos 005/006/007.
- [ ] Levantar la base: `docker compose up -d`. Requiere datos de prueba (Ayudas, Aportes,
      Solicitudes) para validar el panel a ojo.

## 1. Verificaciones previas (sin cambios de schema)

- [ ] Comprobar que existen los índices necesarios: `Ayuda(estado)`,
      `Aporte(ayudaId, recursoId, estado)`, `Solicitud(estado)`, `Solicitud(sector)`. Si falta
      alguno, **añadirlo en el módulo dueño**, no en `panel/`.

## 2. Lecturas agregadas en módulos dueños

### 005 · Ayudas
- [ ] `contarAyudasPorEstado` (application) + su implementación en `PrismaAyudaRepository` si es
      necesario un método específico.
- [ ] `listarPrioridadRecolectando` (application): devuelve envíos `RECOLECTANDO` con su porcentaje
      de completitud, ordenados por `porcentaje` desc y luego `fecha` asc.
- [ ] Tests unitarios de ambas.

### 006 · Aportes
- [ ] `contarAportesPendientes` (application) — cuenta aportes `COMPROMETIDO`.
- [ ] Test unitario.

### 007 · Solicitudes
- [ ] `contarSolicitudesPorUrgencia(deps, filtro?)` (default `estado = ABIERTA`).
- [ ] `sectoresTop(deps, filtro?, limite = 5)` con normalización `trim + lowercase` en el `groupBy`.
- [ ] `contarSolicitudesAbiertasPorSector(deps, sector)`.
- [ ] Tests unitarios de las tres.

## 3. Módulo `panel` — application

- [ ] Crear `src/modules/panel/application/obtener-resumen-panel.ts` con el caso de uso
      `obtenerResumenPanel(deps)`; ejecuta lecturas en paralelo (`Promise.all`).
- [ ] Test `obtener-resumen-panel.test.ts`:
      - Compone conteos correctos.
      - Ordena `enviosPrioridad` por porcentaje desc, empate por fecha asc.
      - `sectoresTop` normaliza y limita.
- [ ] Mantener `panel/application` puro (sin framework ni Prisma).

## 4. Presentación

- [ ] Ruta `/(admin)/panel/page.tsx` — server component con `requireRol(ADMIN)`; invoca
      `obtenerResumenPanel` y renderiza `PanelResumen`.
- [ ] Componentes en `src/modules/panel/ui/`:
      - `PanelResumen`, `TarjetaMetrica`, `BloqueEnviosPrioridad`, `BloqueSolicitudesAbiertas`,
        `BloqueAportesPendientes`, `AccesosDirectos`.
- [ ] Cada tarjeta / bloque enlaza con `<Link />` al listado correspondiente con el filtro
      aplicado (query string).
- [ ] Formatear fechas con Luxon.
- [ ] Confirmar que `proxy.ts` cubre `/(admin)/panel` (ya cubre `/panel/:path*`).

## 5. Composición (wiring)

- [ ] Exponer fachada `@/shared/panel` (o equivalente) que componga los repos + casos de uso de
      005/006/007 y ofrezca `obtenerResumenPanel` listo. `app`/`ui` no importan
      `infrastructure`/`lib` directamente.

## 6. Cacheo (revisar tras medir)

- [ ] Medir latencia en dev con datos representativos.
- [ ] Si es alta, añadir `export const revalidate = 30` (o similar) en la página. **No** optimizar
      sin medir.

## 7. Tests (Vitest)

- [ ] `obtenerResumenPanel` (ver arriba).
- [ ] Los tests unitarios de las nuevas lecturas viven en el módulo dueño.
- [ ] Todos en verde.

## 8. Validación final

- [ ] `docker compose up -d` y base con datos representativos (varias Ayudas, aportes mixtos,
      solicitudes en distintos estados y urgencias).
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: como `ADMIN`, abrir `/(admin)/panel`; verificar tarjetas, orden del bloque
      prioridad, y que cada link lleva al listado con el filtro correcto. Como no-`ADMIN`,
      verificar que no accede.

## 9. Cierre

- [ ] Revisar que `panel/application` sigue puro (sin framework/Prisma).
- [ ] Generar/actualizar `DOC/features/008-panel-de-administracion.md` para reflejar lo entregado.
- [ ] Mover `008 · Panel de administración` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `009 · Tablero público de transparencia` a **Siguiente 🔜**.
