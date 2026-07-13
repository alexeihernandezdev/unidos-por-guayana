# 026 · Guía de diseño y layout consistente — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones, límites duros y § Estilo visual). **Sin dependencias npm nuevas.**

## Enfoque general

Es una feature de **chrome/consistencia visual**, no de dominio. Orden de trabajo:

1. **Escribir la guía** `constitution/ui-guidelines.md` (fija el contrato de tokens de layout).
2. **Construir los componentes** `<PanelPage>` / `<PanelPageHeader>` / `<PanelPageSubHeader>` que materializan la guía.
3. **Migrar una página piloto** de cada tipo (índice + subpágina) y revisar a ojo.
4. **Propagar** al resto del espacio logeado, conservando el cuerpo de cada página.
5. **Eliminar el `<main>` anidado** en el proceso.
6. Tests de piezas puras + validación por rol.

> ⚠️ Antes de tocar componentes de Next 16, leer `node_modules/next/dist/docs/` (AGENTS.md). No hay cambios de datos, dominio ni permisos.

## 1. Modelo de datos y migración

- **Sin cambios.** No hay tablas, enums ni columnas. No hay migración.

## 2. Guía de diseño (`constitution/ui-guidelines.md`)

Documento nuevo, referenciado desde `tech-stack.md § Estilo visual`. Contenido:

### 2.1 Contenedor de página

Todas las páginas del espacio logeado se envuelven en `<PanelPage>`, que rinde:

```
mx-auto flex w-full flex-1 flex-col gap-7 p-5 md:p-8 lg:p-10
```

Ancho por `size`:

| `size`    | Clase        | Uso                                                    |
| --------- | ------------ | ------------------------------------------------------ |
| `default` | `max-w-5xl`  | Índices y detalles de contenido medio (por defecto)    |
| `wide`    | `max-w-6xl`  | Tablas anchas o mapas (Puntos de acopio, Red)          |
| `narrow`  | `max-w-3xl`  | Formularios simples (nuevo/editar de una entidad)      |

- **Ritmo vertical:** `gap-7` entre bloques de página (encabezado, filtros, tabla…). Formularios internos usan `gap-6`.
- **No es `<main>`:** `AppShell` (021) ya provee el `<main>`. `<PanelPage>` es `<div>` (o `<section>`), replicando `flex flex-1 flex-col` para no perder el estiramiento vertical.

### 2.2 Escala tipográfica de página

Familia por elemento (usa las tres ya definidas en `tech-stack.md`; alias Tailwind `font-sans` / `font-mono` / `font-serif`):

| Elemento                          | Familia     | Clases                                                       |
| --------------------------------- | ----------- | ------------------------------------------------------------ |
| `h1` en índice (con banner)       | `font-sans` | `text-2xl font-semibold tracking-tight md:text-3xl`          |
| `h1` en subpágina (ligero)        | `font-sans` | `text-2xl font-semibold tracking-tight`                      |
| Descripción bajo el título        | `font-sans` | `text-sm leading-6` (banner: `text-white/75`; ligero: `text-muted-foreground`) |
| Eyebrow (solo banner)             | `font-sans` | `mb-1 text-sm text-white/70`                                 |
| `h2` de sección dentro del cuerpo | `font-sans` | `text-sm font-semibold` (o el `profile-section-heading` ya existente) |
| Números, contadores, fechas       | `font-mono` | `font-mono … numeric-tnum` (métricas, tablas, `DispatchStrip`) |

Reglas de familia:

- **`font-sans` (Geist Sans)** es la fuente por defecto de títulos, cuerpo y UI del panel. Los componentes de encabezado **no** aplican `font-serif`.
- **`font-mono` (Geist Mono) + `numeric-tnum`** para todo dato numérico tabular (cantidades, porcentajes, fechas, contadores), como ya hacen `TarjetaMetrica` y `DispatchStrip`.
- **`font-serif` (EB Garamond)** queda **reservado** al wordmark y a la landing editorial; **no** se introduce en los títulos del panel (mantener la coherencia con la referencia Puntos de acopio/Perfil, que son sans). Cambiar los títulos del panel a serif sería una decisión de dirección aparte, fuera de esta feature.

### 2.3 Encabezado banner (índices) — `<PanelPageHeader>`

Anatomía (derivada de Puntos de acopio / Mi perfil):

```
header.rounded-xl.bg-primary-ink.px-6.py-7.text-primary-foreground.md:px-8
  div.flex.items-start.gap-4  (md: justify-between si hay actions)
    span.grid.size-11.shrink-0.place-items-center.rounded-lg.bg-white/10 > <Icon className="size-5" strokeWidth={1.5} aria-hidden />
    div
      p.mb-1.text-sm.text-white/70            → eyebrow
      h1.text-2xl.font-semibold.tracking-tight.md:text-3xl → title
      p.mt-2.max-w-2xl.text-sm.leading-6.text-white/75     → description
    (opcional) div.actions                     → botones/acciones
```

### 2.4 Encabezado ligero (subpáginas) — `<PanelPageSubHeader>`

```
header.flex.flex-col.gap-2
  Link.inline-flex.items-center.gap-1.5.text-sm.text-muted-foreground.hover:text-foreground > <ArrowLeft className="size-4" /> {backLabel}
  div.flex.items-end.justify-between.gap-4
    div
      h1.text-2xl.font-semibold.tracking-tight → title
      p.text-sm.text-muted-foreground          → description (opcional)
    (opcional) div.actions
```

### 2.5 Listados de datos (row-cards, estándar Puntos de acopio)

Los listados se presentan como **lista de row-cards**, no como `<table>`. Anatomía (derivada de `PuntosAcopioGestion`):

```
(barra-resumen)  div.flex.flex-wrap.items-center.justify-between.gap-4.rounded-lg.border.bg-card.p-4
                   p.text-sm.text-muted-foreground   → conteo/resumen ("N puntos en total")
                   (acción primaria)                 → Button "Nuevo …"

(listado)        div.divide-y.overflow-hidden.rounded-lg.border.bg-card
                   article.flex.flex-col.gap-4.p-4.hover:bg-muted/30.md:flex-row.md:items-center.md:justify-between
                     div.flex.min-w-0.items-start.gap-3
                       span.profile-icon.size-10 > <Icon />        → chip de icono
                       div.min-w-0
                         div.flex.flex-wrap.items-center.gap-2 → h2 (título) + badge (pill de estado)
                         p.mt-0.5.text-sm.text-muted-foreground → línea secundaria
                         div.mt-2.flex.flex-wrap.gap-x-4.gap-y-1.text-xs.text-muted-foreground → metadatos
                           span.inline-flex.items-center.gap-1 > <Icon.size-3.5 /> {texto}   (×N)
                     div.flex.shrink-0.gap-2.md:justify-end → acciones (Editar / Archivar…)

(vacío)          div.flex.flex-col.items-center.gap-3.border-t.border-border.py-16.text-center
                   span (chip icono) + título + descripción + CTA
```

- **Números dentro de la card** (cantidades, montos, fechas) en `font-mono` + `numeric-tnum` (ver §2.2).
- **Badges de estado**: pill `rounded-full px-2 py-0.5 text-xs`; activo con `bg-primary/10 text-primary-ink`, neutro con `bg-muted text-muted-foreground` (patrón ya usado en acopio y recursos).
- **Desktop semitabular:** la fila puede alinear sus metadatos en columnas ordenadas dentro del `md:flex-row`; el stack a una columna se reserva a `< md`. Así los listados densos no pierden escaneabilidad.

### 2.6 Reglas

- **Un solo `<main>` por documento** (lo provee `AppShell`).
- Índice de sección → banner; detalle/formulario → ligero.
- **Listados → row-cards** (`<PanelList>`/`<PanelListRow>`), no `<table>`.
- No reescribir a mano `mx-auto flex w-full max-w-… p-… gap-…` en un `page.tsx`: usar `<PanelPage>`.
- Respetar los límites duros de `tech-stack.md § Estilo visual` (sin `transition: all`, `ease-out`, radios del token, etc.).

## 3. Componentes compartidos

Ubicación: `src/shared/ui/panel/` (barril `index.ts`) o dentro de `src/shared/ui/app-shell/`. _Recomendado:_ carpeta propia `src/shared/ui/panel/` para no mezclar con el sidebar; reexportar desde el barril de `app-shell` si conviene. Archivos kebab-case (convención de `src/shared/ui`, ver `tech-stack.md`).

- `panel-page.tsx` → `PanelPage({ size = "default", className?, children })`. Resuelve `size → max-w` con un mapa puro (`PANEL_MAX_W`) para poder testearlo. Usa `cn`.
- `panel-page-header.tsx` → `PanelPageHeader({ icon: LucideIcon, eyebrow, title, description?, actions? })`. Server component.
- `panel-page-sub-header.tsx` → `PanelPageSubHeader({ title, backHref?, backLabel?, description?, actions? })`. Server component (usa `<Link>`).
- `panel-list.tsx` → `PanelList({ children })` (contenedor `divide-y …`) + `PanelListToolbar({ resumen, children })` (barra superior con conteo + acción).
- `panel-list-row.tsx` → `PanelListRow({ icon, title, badge?, secondary?, meta?, actions? })`. `meta`: `{ icono: LucideIcon; texto: ReactNode }[]`. Presentación pura; colapso `md:flex-row`.
- `panel-empty-state.tsx` → `PanelEmptyState({ icon, title, description, action? })`.
- _(Opcional)_ `panel-section-tabs.tsx` → `PanelSectionTabs({ items, activo })` para la sub-nav Perfil/Puntos de acopio, reutilizando `profile-section-link`.
- `index.ts` barril con todos los componentes y `PANEL_MAX_W`.

Notas:

- `icon` se recibe como componente (`LucideIcon`), se rinde con `strokeWidth={1.5}` (regla de iconografía).
- `actions` es un `ReactNode` (normalmente `<Button asChild><Link/></Button>`), alineado a la derecha en `md:`.
- Sin estado ni efectos: los de encabezado/listado son componentes de presentación puros → cero riesgo de capa (`ui` no importa `infrastructure`).
- `PanelListRow` no conoce el dominio: cada listado le pasa título/badge/metadatos/acciones ya formateados. Los server actions y `router.refresh()` de cada listado se conservan; solo cambia el marcado.
- **Puntos de acopio (`PuntosAcopioGestion`) es el origen del patrón:** al extraer los componentes, refactorizarlo para consumirlos sin cambio visible (valida que la abstracción es fiel).

## 4. Clasificación de páginas (índice vs subpágina) y ancho

**Índices (banner, `<PanelPageHeader>`):**

| Página                                  | `size`  | Icono / eyebrow sugeridos            |
| --------------------------------------- | ------- | ------------------------------------ |
| `(admin)/panel` (dashboard)             | `wide`  | ver §5 (DispatchStrip)               |
| `(admin)/panel/actividades`             | default | `Truck` · "Operación"                |
| `(admin)/panel/recursos`                | default | `Package` · "Catálogo"               |
| `(admin)/panel/solicitudes`             | default | `Inbox` · "Operación"                |
| `(admin)/panel/donaciones`              | default | `HandCoins` · "Transparencia"        |
| `(admin)/panel/red`                     | `wide`  | `Users` · "Red operativa"            |
| `(admin)/panel/perfil`                  | default | `UserRound` · "Cuenta administradora" (ya está) |
| `(admin)/panel/puntos-acopio`           | `wide`  | `Warehouse` · "Red operativa" (ya está) |
| `superadmin/admins`                     | default | `ShieldCheck` · "Aprobaciones"       |
| `(app)/actividades`                     | default | `Truck`                              |
| `(app)/mis-aportes`                     | default | `HandHeart`                          |
| `(app)/puntos-acopio`                   | `wide`  | `MapPinned`                          |
| `(app)/mi-perfil`                       | default | `UserRound`                          |
| `(app)/solicitudes`                     | default | `Inbox`                              |

**Subpáginas (ligero, `<PanelPageSubHeader>`):**

- Actividades: `nueva`, `[id]`, `[id]/editar`.
- Recursos: `nuevo`, `[id]/editar`, `propuestas`.
- Donaciones: `nuevo`, `[id]/editar`, `ingresos/nuevo`.
- Solicitudes (admin): `[id]`.
- `(app)` solicitudes: `nueva`, `proponer-recurso`, `[id]`, `[id]/editar`.
- `(app)` actividades: `[id]`, `[id]/aportar`.
- `(app)` puntos-acopio: `[id]`.

> El icono/eyebrow exacto se ajusta a ojo; usar la familia `lucide-react` ya en uso y `strokeWidth={1.5}`.

## 5. Dashboard `/panel` y `DispatchStrip`

- **Recomendado:** envolver el dashboard en `<PanelPage size="wide">` y sustituir `DispatchStrip` por `<PanelPageHeader icon={Gauge} eyebrow="Panel" title="…" description={resumenOperativo} />`, pasando el resumen ("N por preparar, N listos…") como `description` o como `actions`/badges. Verificar que no se pierda información del `DispatchStrip`.
- **Alternativa:** conservar `DispatchStrip` pero moverlo dentro de `<PanelPage>` para unificar padding/ancho. Elegir en implementación tras ver ambos a ojo; por defecto, la opción recomendada.

## 5b. Conversión de listados a row-cards

Extraer el patrón de `PuntosAcopioGestion` a `<PanelList>`/`<PanelListRow>`/`<PanelListToolbar>`/`<PanelEmptyState>` y convertir cada listado. Por listado: mapear cada columna a un slot de la row-card (título, badge, secundaria, metadatos) y las acciones a `actions`, conservando datos y server actions.

| Componente actual (`<table>`)        | Sección                         | Notas de mapeo                                        |
| ------------------------------------ | ------------------------------- | ---------------------------------------------------- |
| `RecursosTabla`                      | admin Recursos                  | título = nombre; badge = estado + aprobación; meta = unidad/categoría |
| `PropuestasTabla`                    | admin Recursos › propuestas     | acciones aprobar/rechazar                             |
| `ActividadesTabla`                   | admin + app Actividades         | título = actividad; badge = estado + tipo; meta = fecha/sector |
| `SolicitudesTabla`                   | admin + app Solicitudes         | badge = urgencia/estado; meta = sector/fecha         |
| `AportesTabla`                       | app Mis aportes / detalle       | montos/cantidades en `font-mono`                     |
| `AportantesTabla`                    | detalle Actividad (023)         | solo lectura; sin acciones                            |
| `MediosDonacionTabla`                | admin Donaciones                | acciones editar/archivar                              |
| `IngresosMonetariosTabla`            | admin Donaciones › ingresos     | montos en `font-mono`; listado denso → usar layout semitabular en desktop |
| `RedTabla`                           | admin Red (025)                 | verificar si ya es card-like; alinear al patrón      |
| tablas inline `mis-aportes`, `solicitudes/[id]` (admin/app) | varias         | extraer a row-cards con los mismos componentes        |
| `ProgresoMetas`                      | detalle Actividad               | **revisar**: es un display de progreso, no un listado tabular; puede conservarse |

- Reutilizar `<PanelListToolbar>` para las barras "N recursos · Nuevo recurso" y `<PanelEmptyState>` para los estados vacíos (hoy dispares entre listados).
- Números (cantidades, montos, fechas) en `font-mono` + `numeric-tnum`.

## 6. Migración

1. Página piloto: **Recursos** (índice + `RecursosTabla` → row-cards) + **Recurso "nuevo"** (subpágina). Migrar, revisar a ojo desktop/móvil.
2. Propagar por grupos: `(admin)/panel/*`, luego `/superadmin`, luego `(app)/*`.
3. En cada página:
   - Reemplazar el `<main className="mx-auto flex … p-… gap-…">…</main>` por `<PanelPage size=…> … </PanelPage>`.
   - Reemplazar el encabezado (`<div className="flex … justify-between">` o el banner inline) por `<PanelPageHeader …>` (índice) o `<PanelPageSubHeader …>` (subpágina).
   - Convertir el listado (`<table>`) a `<PanelList>`/`<PanelListRow>` según §5b; conservar filtros, formularios y mapas literalmente.
4. Puntos de acopio y Perfil: mover su banner inline a `<PanelPageHeader>` sin cambio visible; refactorizar `PuntosAcopioGestion` para consumir `<PanelList>`/`<PanelListRow>` (origen del patrón); su sub-nav a `<PanelSectionTabs>` si se creó.

## 7. Tests (Vitest)

- `PANEL_MAX_W` / mapa `size → max-w`: cada `size` mapea a la clase esperada (`default→max-w-5xl`, `wide→max-w-6xl`, `narrow→max-w-3xl`).
- _(Opcional)_ smoke render de `<PanelPageHeader>` (title/eyebrow/description presentes) y `<PanelPageSubHeader>` (link "volver" con `backHref`) con `@testing-library/react` si ya está configurado; si no, mantener solo la pieza pura.

## 8. Decisiones

- **Layout centralizado en componentes**; los `page.tsx` dejan de declarar clases de contenedor/encabezado.
- **Estándar = Puntos de acopio** (`p-5 md:p-8 lg:p-10`, `gap-7`, banner `bg-primary-ink`, `h1` hasta `md:text-3xl`).
- **Banner para índices, ligero para subpáginas**; `size` cubre tablas/mapas anchos vs formularios estrechos.
- **Listados como row-cards** (estándar Puntos de acopio), no `<table>`; patrón centralizado en `<PanelList>`/`<PanelListRow>`.
- **Un solo `<main>`** (el de `AppShell`); `<PanelPage>` es contenedor semántico no-`<main>`.
- **Guía en la constitución** como fuente de verdad, referenciada desde `tech-stack.md`.
- **Sin dependencias nuevas.**

## 9. Validación final

1. Postgres arriba + usuarios sembrados (`db:seed`; ver AGENTS.md).
2. `pnpm test` (piezas nuevas en verde).
3. `pnpm exec eslint src` / `pnpm build` sin errores.
4. `pnpm dev`, por cada rol (`ADMIN`, `SUPERADMIN`, `COLABORADOR`, `SOLICITANTE`):
   - Recorrer cada sección: padding, ancho y encabezado uniformes; índices con banner, subpáginas con encabezado ligero.
   - Desktop y móvil (`< md`): el contenedor colapsa bien, un solo `<main>` (revisar en DevTools).
   - Puntos de acopio y Perfil idénticos a antes.

## Al terminar

- Crear/confirmar `constitution/ui-guidelines.md` y su enlace desde `tech-stack.md`.
- Actualizar `constitution/roadmap.md`: mover `026` a **Hecho ✅**.
- Generar/actualizar `DOC/features/026-guia-de-diseno-y-layout-consistente.md` con lo entregado.
