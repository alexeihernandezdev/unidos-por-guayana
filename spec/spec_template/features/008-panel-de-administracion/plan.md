# 008 · Panel de administración — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros).

## Enfoque general

El panel es una **superficie de agregación read-only** sobre los módulos ya existentes (005/006/007).
No introduce dominio propio. Orden:
**añadir lecturas agregadas faltantes en cada módulo dueño → caso de uso `obtenerResumenPanel` en
`panel/application` → server component `/(admin)/panel` que compone la UI → tests → validación**.

> ⚠️ Antes de tocar route handlers, server actions o server components de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md). La protección por rol reutiliza la feature 002.

## 1. Modelo de datos y migración

- **Sin cambios de schema.** No se crean tablas, enums ni columnas nuevas.
- Verificar que existen los índices que las lecturas agregadas necesitan:
  - `Ayuda(estado)` — para `contarAyudasPorEstado`.
  - `Aporte(ayudaId, recursoId, estado)` — ya añadido en 006 para el progreso.
  - `Solicitud(estado)` y `Solicitud(sector)` — ya añadidos en 007.
  Si alguno falta, añadirlo en el módulo dueño (no en `panel/`).

## 2. Lecturas agregadas en los módulos dueños

Añadir donde no existan (respetando la pureza de capas de cada módulo):

- **005 · Ayudas** (`ayudas/application`):
  - `contarAyudasPorEstado(deps)` → `Record<EstadoAyuda, number>`.
  - `listarPrioridadRecolectando(deps)` → `Array<{ ayuda, porcentaje }>` ordenada por porcentaje
    desc, luego `fecha` asc.
    - Puede componer con `progresoDeAyuda` (006) o exponer un método específico en
      `AyudaRepository`/`AporteRepository` para agrupar el porcentaje sin abrir el detalle completo.
- **006 · Aportes** (`aportes/application`):
  - `contarAportesPendientes(deps)` → `number` (aportes `COMPROMETIDO`).
- **007 · Solicitudes** (`solicitudes/application`):
  - `contarSolicitudesPorUrgencia(deps, filtro?)` → `Record<UrgenciaSolicitud, number>` (por defecto
    solo `ABIERTA`).
  - `sectoresTop(deps, filtro?, limite = 5)` → `Array<{ sector, conteo }>` con `groupBy` sobre
    `Solicitud` filtrada por `estado = ABIERTA`, normalizando por `trim + lowercase` en el momento del
    conteo.
  - `contarSolicitudesAbiertasPorSector(deps, sector)` → `number` (para el bloque de prioridad de
    envíos).
- Cada nueva función lleva su test en el módulo dueño.

## 3. Módulo `panel` — solo `application` y `ui`

Estructura:

```
src/modules/panel/
├── application/
│   ├── obtener-resumen-panel.ts
│   └── obtener-resumen-panel.test.ts
└── ui/
    ├── PanelResumen.tsx
    ├── TarjetaMetrica.tsx
    ├── BloqueEnviosPrioridad.tsx
    ├── BloqueSolicitudesAbiertas.tsx
    ├── BloqueAportesPendientes.tsx
    └── AccesosDirectos.tsx
```

**Sin `domain` ni `infrastructure` propios.** ESLint no debería quejarse: `application` importa
únicamente contratos/casos de uso de los módulos dueños (o sus fachadas de composición).

### `obtenerResumenPanel(deps)`

- Recibe en `deps` las funciones/repos ya expuestos por 005/006/007 (patrón `@/shared/…`).
- Devuelve el DTO descrito en la spec (`enviosPorEstado`, `progresoAgregadoRecolectando`,
  `solicitudesAbiertasPorUrgencia`, `aportesPendientesConteo`, `sectoresTop`, `enviosPrioridad`).
- Ejecuta las lecturas **en paralelo** (`Promise.all`) para minimizar latencia.
- Es puro: sin acceso directo a Prisma ni a Next.

## 4. Presentación

- Ruta `/(admin)/panel/page.tsx` — server component:
  - `requireRol(ADMIN)` (feature 002).
  - Invoca `obtenerResumenPanel` con la composición ya inyectada.
  - Renderiza `PanelResumen` pasando el DTO.
- Componentes en `panel/ui`:
  - `TarjetaMetrica` — número grande + etiqueta + link al listado.
  - `BloqueEnviosPrioridad` — tabla/lista con `titulo`, `sector`, `fecha` (Luxon), `porcentaje` como
    barra y "N solicitudes afines". Cada fila enlaza a `/(admin)/panel/ayudas/[id]`.
  - `BloqueSolicitudesAbiertas` — conteos por urgencia con enlaces filtrados a
    `/(admin)/panel/solicitudes?urgencia=ALTA` etc.
  - `BloqueAportesPendientes` — número + link a los aportes `COMPROMETIDO`.
  - `AccesosDirectos` — botones-link a "Nueva Ayuda", "Nuevo Recurso", "Ver solicitudes".
- Sin server actions propias; los CTAs son `<Link />` de Next.

## 5. Composición (wiring)

- Exponer una fachada `@/shared/panel` (o equivalente) que componga los repos + casos de uso de
  005/006/007 y ofrezca `obtenerResumenPanel` listo. Mantener `app` sin importar
  `infrastructure`/`lib` directamente.

## 6. Cacheo (revisar después de medir)

- Marcar la página con `export const revalidate = 30` (o similar) **solo** si en dev/staging se ve
  latencia alta al cargar el panel. Empezar sin caché y medir.
- No introducir capa de caché ad-hoc.

## 7. Tests (Vitest)

- `obtenerResumenPanel`:
  - Compone conteos correctos por estado / urgencia.
  - Ordena `enviosPrioridad` por `porcentaje` desc, empate resuelto por `fecha` asc.
  - `sectoresTop` normaliza (`trim + lowercase`) al agrupar; devuelve top-N.
  - Ejecuta lecturas en paralelo (test smoke: llamadas realizadas, no importa el orden).
- Tests unitarios de las nuevas lecturas agregadas se colocan en el módulo dueño (005/006/007), no
  aquí.

## Decisiones

- **Sin dominio propio en `panel`:** no hay entidad; solo composición de lecturas de otros módulos.
- **Panel read-only:** las mutaciones son responsabilidad del módulo dueño.
- **Sin librería de charts:** barras CSS bastan para el MVP; añadir una librería es una decisión
  aparte.
- **Agregaciones donde viven los datos:** las funciones de conteo/`groupBy` se implementan en el
  módulo dueño, no en `panel`, para que `panel/application` siga pura y desacoplada.

## Validación final

1. `docker compose up -d` y base con datos de prueba (crear un par de Ayudas, aportes en varios
   estados, solicitudes con distintas urgencias).
2. `pnpm test` (nuevos casos de uso + `obtenerResumenPanel` en verde).
3. `pnpm lint` / `pnpm build` sin errores.
4. `pnpm dev`: como `ADMIN` abrir `/(admin)/panel`, verificar tarjetas, orden del bloque prioridad y
   que cada link lleva al listado con el filtro correcto. Como no-`ADMIN`, verificar que no accede.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `008 · Panel de administración` a **Hecho ✅** y
  promover `009 · Tablero público de transparencia` a **Siguiente 🔜**.
- Generar/actualizar `DOC/features/008-panel-de-administracion.md` para reflejar lo entregado.
