# 028 · Rediseño del panel administrativo — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md § Estilo visual` y
> `constitution/ui-guidelines.md`. **Sin dependencias npm nuevas, sin migraciones.**

## Enfoque general

Feature de chrome/UX en tres pasadas, de adentro hacia afuera:

1. **Primitivos** (`src/shared/ui/panel/`): refinar y añadir `PanelFilters`. Todo retrocompatible.
2. **Secciones**, una a una: Actividades → Solicitudes → Recursos/Propuestas → Donaciones → Red → Perfil/Centros → Superadmin. Cada sección adopta primitivos, tokens y nomenclatura.
3. **Cierre**: guía `ui-guidelines.md`, `DOC/features/028`, roadmap, lint + build.

## 1. Primitivos

### 1.1 `panel-page-header.tsx`

- Mantener API (`icon`, `eyebrow`, `title`, `description`, `actions`).
- Añadir profundidad: capa `radial-gradient` sutil con `color-mix` sobre `--primary-ink` (sin gradient-text ni glassmorphism; es superficie, permitido) e icono fantasma decorativo (`Icon` grande, `opacity` baja, `hidden lg:block`, `aria-hidden`).
- Exportar estilos de acción sobre banner desde el barril:
  - `PANEL_HEADER_ACTION.primary` → `bg-white text-primary-ink hover:bg-white/90`
  - `PANEL_HEADER_ACTION.secondary` → `border border-white/15 bg-white/10 text-primary-foreground hover:bg-white/20`
  Se aplican como `className` sobre `<Button>` (la primera con `variant="secondary"` como base neutra).

### 1.2 `panel-filters.tsx` (nuevo)

- `PanelFilters`: `<form method="get" className="flex flex-wrap items-end gap-x-3 gap-y-4 rounded-lg border bg-card p-4">` + botón «Aplicar» (`variant="outline"`, `size="sm"`) + link «Limpiar» (`href` del índice) visible solo si `activos > 0`.
- Props: `children`, `limpiarHref?`, `activos?: number`, `className?`. Server component.
- `PanelFiltersField`: `label` (o `<span>` para Radix Select) + control; `text-xs font-medium text-muted-foreground` en la etiqueta.

### 1.3 `panel-badge.tsx`

- Tonos → tokens: `warning: bg-warning/15 text-warning-ink`, `success: bg-success/15 text-success-ink`, `danger: bg-destructive/10 text-destructive`, `active`/`neutral` iguales.
- Prop `dot?: boolean`: punto `size-1.5 rounded-full bg-current` antes del texto.

### 1.4 `panel-list-row.tsx`

- Nueva prop `detail?: ReactNode`: bloque ancho completo bajo la fila (`border-t` + padding), para bandeja superadmin.
- Hover `hover:bg-muted/40`; sin cambios de anatomía.

### 1.5 `panel-empty-state.tsx`

- Variante sin `bordered`: contenedor `rounded-lg border border-dashed` propio (reemplaza los `<p>` sueltos).

## 2. Secciones

Patrón por sección (leer los componentes del módulo antes de tocar):

- Índice: `PanelPageHeader` (acciones con `PANEL_HEADER_ACTION`), `PanelFilters` con los mismos campos GET, listado con `PanelList`/`PanelListRow`, vacío con `PanelEmptyState` (con CTA cuando aplique).
- Formularios: `Input`/`Label` compartidos en lugar de la constante `campo`; grupos con `fieldset`/heading de sección existentes.
- Eliminar/archivar: botón con énfasis destructivo (`text-destructive hover:bg-destructive/10`, ghost), separado visualmente.
- Números y fechas: `font-mono numeric-tnum` (ya mayormente correcto).
- Literales «punto de acopio» → «centro de acopio» (rutas y tipos intactos).

Casos particulares:

- **Recursos**: revisar acciones del banner («Ver propuestas» + «Nuevo recurso») con los nuevos estilos; resolver el «botón blanco» del pendiente.
- **Red**: chips de categoría con `PanelBadge` o clases token (`bg-primary/10 text-primary-ink`).
- **Superadmin**: `BandejaAdmins` → `PanelList` + `PanelListRow` con `detail` para el `<dl>` del perfil; vacío con `PanelEmptyState`.
- **Perfil / Centros de acopio**: son la referencia visual; solo alinear filtros/toolbar si divergen y nomenclatura.

## 3. Validación

- `npm run lint`, `npm run build`.
- Revisión manual: 375px y desktop; foco visible; contraste de acciones sobre banner.
- Grep final: sin `bg-amber-`, sin constante `campo`, sin «punto de acopio» visible en el alcance.

## 4. Documentación

- `constitution/ui-guidelines.md`: nueva sección «Filtros de listado», acciones sobre banner en §3, `detail` en §5, tonos de `PanelBadge`.
- `DOC/features/028-rediseno-panel-administrativo.md` (lenguaje llano).
- `constitution/roadmap.md`: registrar la 028.
