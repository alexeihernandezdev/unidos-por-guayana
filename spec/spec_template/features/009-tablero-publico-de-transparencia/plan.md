# 009 · Tablero público de transparencia — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones, estilo visual y límites duros).

## Enfoque general

El tablero es una **superficie de agregación read-only y pública** sobre 005/006, sin dominio propio
y **sin datos personales**. Orden:
**añadir/verificar lecturas agregadas publicables en los módulos dueños → casos de uso
`obtenerResumenPublico` / `obtenerDetallePublico` en `transparencia/application` → server components
públicos `/transparencia` y `/transparencia/[id]` → enlace desde la landing → tests → validación**.

> ⚠️ Antes de tocar server components, `revalidate`/ISR o `generateMetadata` de Next 16, leer la guía
> en `node_modules/next/dist/docs/` (AGENTS.md). Esta vista **no** usa `requireRol`: es pública.

## 1. Modelo de datos y migración

- **Sin cambios de schema.** No se crean tablas, enums ni columnas.
- Verificar que existen los índices que las lecturas necesitan (ya añadidos por 005/006):
  - `Ayuda(estado)`, `Ayuda(fecha)` — para el listado público ordenado.
  - `Aporte(ayudaId, recursoId, estado)` — para el recolectado y el progreso.
  Si alguno falta, añadirlo **en el módulo dueño**, no en `transparencia/`.

## 2. Lecturas agregadas en los módulos dueños (solo si faltan)

Reutilizar lo de 008 antes de crear nada. Añadir donde no exista, respetando la pureza de capas:

- **005 · Ayudas** (`ayudas/application`):
  - `listarEnviosPublicos(deps)` → `Array<{ ayuda, porcentaje }>` de **todos** los envíos, ordenados
    por `fecha` desc. Puede componer con `progresoDeAyuda` (006) o reutilizar
    `listarPrioridadRecolectando` (008) generalizándolo a todos los estados.
  - `obtenerAyuda` (ya existe) para la cabecera del detalle público.
- **006 · Aportes** (`aportes/application`):
  - `recolectadoPorRecurso(deps)` → `Array<{ recursoId, cantidadRecibida }>` con `groupBy` sobre
    aportes `RECIBIDO`; para `MONETARIO`, agrupar además por moneda.
  - `progresoDeAyuda(deps, ayudaId)` (ya previsto en 006) para las metas del detalle.
- Cada nueva función lleva su test en el módulo dueño.

> Si 006 aún no está implementado (ver roadmap), montar `transparencia` contra la estructura de metas
> de 005 devolviendo `cantidadRecibida = 0` / agregados vacíos, y completar cuando 006 aterrice. No
> bloquear 009 por ello.

## 3. Módulo `transparencia` — solo `application` y `ui`

Estructura:

```
src/modules/transparencia/
├── application/
│   ├── obtener-resumen-publico.ts
│   ├── obtener-resumen-publico.test.ts
│   ├── obtener-detalle-publico.ts
│   └── obtener-detalle-publico.test.ts
└── ui/
    ├── ResumenTransparencia.tsx
    ├── TotalesImpacto.tsx
    ├── RecolectadoPorRecurso.tsx
    ├── ListaEnviosPublicos.tsx
    ├── TarjetaEnvioPublico.tsx
    ├── DetalleEnvioPublico.tsx
    └── BarraProgreso.tsx        (o reutilizar la que exista en shared/ui)
```

**Sin `domain` ni `infrastructure` propios.** `application` importa únicamente contratos/casos de uso
de los módulos dueños (o sus fachadas de composición). ESLint no debería quejarse.

### `obtenerResumenPublico(deps)`

- Recibe en `deps` las funciones/repos expuestos por 005/006.
- Devuelve el DTO **público** de la spec (`totales`, `recolectadoPorRecurso`, `envios`).
- **Construye el DTO incluyendo solo campos publicables** (nunca "todo menos X"): jamás toca
  identidades de aportantes/solicitantes.
- Ejecuta las lecturas **en paralelo** (`Promise.all`). Puro: sin Prisma ni Next.

### `obtenerDetallePublico(deps, ayudaId)`

- Cabecera + `metas` (con `cantidadObjetivo`, `cantidadRecibida`, `%`) + `porcentajeGlobal`.
- Devuelve `null`/marcador si el envío no existe (la ruta traduce a `notFound()`).
- Sin datos personales. Puro.

## 4. Presentación (pública)

- `src/app/transparencia/page.tsx` — server component **sin** `requireRol`:
  - Invoca `obtenerResumenPublico` con la composición inyectada.
  - Renderiza `ResumenTransparencia` con el DTO.
  - `generateMetadata` para SEO (título, descripción), coherente con la landing (003).
- `src/app/transparencia/[id]/page.tsx` — server component público:
  - Invoca `obtenerDetallePublico`; si es nulo, `notFound()`.
  - Renderiza `DetalleEnvioPublico`.
- Componentes en `transparencia/ui`:
  - `TotalesImpacto` — números grandes (`font-mono`, `numeric-tnum`) con etiqueta.
  - `RecolectadoPorRecurso` — filas `recurso` + `cantidadRecibida` + `unidad`; `MONETARIO` por moneda
    con nota de canal externo.
  - `ListaEnviosPublicos` / `TarjetaEnvioPublico` — `titulo`, `sectorDestino`, `fecha` (Luxon),
    `estado`, barra de progreso; `ENTREGADO` destacado. Cada tarjeta enlaza a `/transparencia/[id]`.
  - `DetalleEnvioPublico` — cabecera + metas con barra + progreso global.
  - `BarraProgreso` — barra CSS/Tailwind con `--ease-out-emil`, respetando `prefers-reduced-motion`.
- Enlace a `/transparencia` desde la landing (003) y/o el header público.
- **Sin server actions:** no hay mutaciones. Navegación con `<Link />`.
- Respetar el estilo visual (`tech-stack.md`): paleta ocre/teal, tipografías, **sin em-dash** en
  texto visible, sin eyebrows uppercase decorativos, móvil primero.

## 5. Composición (wiring)

- Exponer una fachada `@/shared/transparencia` (o equivalente) que componga los repos + casos de uso
  de 005/006 y ofrezca `obtenerResumenPublico` / `obtenerDetallePublico` listos. `app`/`ui` no
  importan `infrastructure`/`lib` directamente.

## 6. Cacheo (revisar después de medir)

- Al ser público y no depender de la sesión, es candidato a `export const revalidate = 60` (o ISR).
  **Empezar sin caché y medir**; fijar el `revalidate` solo si hay latencia. No introducir capa de
  caché ad-hoc.

## 7. Tests (Vitest)

- `obtenerResumenPublico`:
  - Compone `totales`, `recolectadoPorRecurso` (agrupado, `MONETARIO` por moneda) y `envios`
    (ordenados por `fecha` desc) correctamente.
  - **Afirma que el DTO no contiene campos personales** (ni nombres, ni ids de usuario, ni contacto).
- `obtenerDetallePublico`:
  - Metas con `cantidadObjetivo`/`cantidadRecibida`/`%` y `porcentajeGlobal` correctos.
  - Sin datos personales; marcador nulo cuando el envío no existe.
- Tests unitarios de las nuevas lecturas agregadas viven en el módulo dueño (005/006), no aquí.

## Decisiones

- **Sin dominio propio en `transparencia`:** no hay entidad; solo composición de lecturas publicables.
- **Público y read-only:** no `requireRol`, no mutaciones; las escrituras viven en los módulos dueños.
- **Privacidad por construcción:** los DTO se arman con campos aptos para publicar, verificado por
  tests. Nunca se reexpone el modelo interno.
- **Agregaciones donde viven los datos:** los `groupBy`/conteos se implementan en el módulo dueño para
  que `transparencia/application` siga pura y desacoplada.
- **Sin librería de charts:** barras CSS bastan para el MVP; añadir una es una decisión aparte.

## Validación final

1. `docker compose up -d` y base con datos de prueba (varios envíos en distintos estados, con metas y
   aportes `RECIBIDO`/`COMPROMETIDO`, incluido algún recurso `MONETARIO`).
2. `pnpm test` (nuevos casos de uso + los del módulo dueño en verde; en especial el test de "sin datos
   personales").
3. `pnpm lint` / `pnpm build` sin errores.
4. `pnpm dev`: **sin iniciar sesión**, abrir `/transparencia`; verificar totales, recolectado por
   recurso, lista de envíos con progreso y destino, y el detalle `/transparencia/[id]`. Confirmar que
   **no** aparece ningún dato personal y que `notFound()` responde ante un id inexistente.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `009 · Tablero público de transparencia` a **Hecho ✅**
  y promover la siguiente feature (`010 · Seguimiento del envío`) a **Siguiente 🔜**.
- Generar/actualizar `DOC/features/009-tablero-publico-de-transparencia.md` para reflejar lo entregado.
