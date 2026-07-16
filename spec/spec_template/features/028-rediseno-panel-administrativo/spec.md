# 028 · Rediseño del panel administrativo

> Estado: **En progreso** · Depende de: `026 · Guía de diseño y layout consistente` (componentes `Panel*`, `ui-guidelines.md`) y `027 · Modal genérico y scrollbar` · Roadmap: `constitution/roadmap.md`
>
> _Feature de **experiencia y consistencia visual**: no introduce entidades, dominio ni permisos nuevos. Eleva la ejecución visual de todas las pantallas administrativas (y superadmin) sin salirse de la constitución: mismos tokens teal/petróleo, mismas familias tipográficas, mismo marco de página de la 026._

## Qué hace

Rediseña la parte administrativa del sistema, **excluyendo el dashboard (`/panel`) y la landing**, que ya recibieron su propio rediseño. Alcance de pantallas:

- `(admin)/panel/actividades` (índice, nueva, detalle, editar)
- `(admin)/panel/solicitudes` (índice, detalle)
- `(admin)/panel/recursos` (+ `propuestas`)
- `(admin)/panel/donaciones`
- `(admin)/panel/red`
- `(admin)/panel/perfil` y `(admin)/panel/puntos-acopio` (referencia visual; solo armonización)
- `/superadmin/admins`

El rediseño trabaja en tres capas:

1. **Primitivos** (`src/shared/ui/panel/`): se refinan `PanelPageHeader`, `PanelBadge`, `PanelListRow`, `PanelEmptyState` y se añade `PanelFilters` (barra de filtros GET estandarizada). API retrocompatible: el dashboard consume los mismos componentes y no se toca su composición.
2. **Composición de página**: cada pantalla adopta los primitivos completos (hoy hay filtros ad-hoc con clases duplicadas, empty states dispares y una bandeja de superadmin fuera del sistema).
3. **Copy y semántica**: nomenclatura visible «Centro de Acopio» (spec `docs/superpowers/specs/2026-07-14-centros-de-acopio-copy-design.md`) en las pantallas tocadas, colores de estado desde tokens semánticos (fuera `bg-amber-100` hardcodeado), números en `font-mono numeric-tnum`.

## Por qué

- **La 026 fijó el marco, pero la ejecución quedó desigual.** Los filtros se escriben a mano en cada página (constante `campo` duplicada), `ActividadesTabla` devuelve un `<p>` como estado vacío, `BandejaAdmins` no usa row-cards, y el banner repite el mismo bloque plano en todas las secciones.
- **Acciones ilegibles sobre el banner.** El botón primario teal sobre el banner `bg-primary-ink` tiene contraste pobre (reportado como «botón blanco en recursos» en `new.features.md`).
- **Tokens a medias.** `PanelBadge` warning usa ámbar hardcodeado en vez de `--warning`/`--warning-ink`; chips de categoría en Mi red con clases sueltas.
- **El cliente pidió nomenclatura «Centro de Acopio»** y sigue habiendo literales visibles con «punto de acopio».

## Decisiones tomadas

- **No se cambia la dirección de arte.** Teal/petróleo, Geist, banner en índices, row-cards, modales de la 027: todo se conserva. El rediseño es de **ejecución**: profundidad, jerarquía, estados y consistencia.
- **`PanelPageHeader` gana profundidad sutil** (capa radial dentro de los hues del token, icono fantasma decorativo en desktop) manteniendo anatomía y API. Se definen **estilos de acción sobre banner**: primaria `bg-white text-primary-ink`, secundaria `bg-white/10 text-primary-foreground` con hairline blanco; se exponen desde el barril para no repetir clases.
- **`PanelFilters` + `PanelFiltersField`** materializan la barra de filtros GET: superficie `bg-card` coherente con `PanelListToolbar`, labels pequeños en `text-muted-foreground`, botón «Aplicar» y link «Limpiar» cuando hay filtros activos. Sustituye a los `<form method="get">` con `border-t` ad-hoc.
- **`PanelBadge` pasa a tokens semánticos** (`--warning`, `--success`, `--destructive`) y suma tono `success` y un punto de estado opcional (`dot`). El color nunca viaja solo: siempre acompaña a texto.
- **`PanelListRow` acepta `detail`** (bloque expandido bajo la fila, ancho completo) para cubrir la bandeja del superadmin sin copiar el marcado; los títulos-link de las filas dejan el teal pleno y pasan a `text-foreground` con hover teal (disciplina de marca: el teal es interacción puntual, no sprinkle).
- **Formularios consumen los primitivos compartidos** (`Input`, `Label`) en lugar de la constante `campo`; los selects de filtro siguen en `FiltroSelect`.
- **Eliminar es acción destructiva**: se presenta con énfasis semántico (texto `destructive`), separada de Ver/Editar.
- **Sin dependencias npm nuevas. Sin migraciones Prisma. Sin cambios de rutas ni server actions.**
- **Solicitudes adopta una bandeja territorial en grid.** El índice administrativo sustituye
  sus row-cards por fichas centradas en el sector. Cada ficha abre una vista rápida con el
  manifiesto de recursos y las acciones de estado existentes; el detalle completo conserva
  su ruta. El listado muestra 12 fichas inicialmente y revela bloques adicionales mediante
  «Cargar más», con entrada escalonada y soporte para movimiento reducido.

## Alcance

**Incluye**

- Refinamiento de `panel-page-header.tsx`, `panel-badge.tsx`, `panel-list-row.tsx`, `panel-empty-state.tsx`; nuevo `panel-filters.tsx`; exportes del barril.
- Adopción en las 8 secciones listadas (filtros, empty states, badges, acciones, formularios).
- Grid administrativo de solicitudes, vista rápida operativa y carga progresiva en bloques
  de 12, sin alterar la lista del espacio solicitante.
- Migración de `BandejaAdmins` a `PanelList`/`PanelListRow` (+ `detail`).
- Nomenclatura «Centro de Acopio» en literales visibles de las pantallas tocadas.
- Actualización de `constitution/ui-guidelines.md` (filtros §nuevo, acciones sobre banner, `detail`).

**No incluye**

- Dashboard `/panel` (composición intacta; solo hereda el refinamiento de primitivos compartidos).
- Landing, transparencia, auth, onboarding (`/completar-perfil`, `/cuenta-admin`).
- Espacio `(app)` de colaborador/solicitante (hereda primitivos, no se recompone).
- `AppShell`/sidebar (chrome de la 021, compartido por todos los roles).
- Renombrar rutas, archivos o entidades técnicas (`/puntos-acopio`, `PuntoAcopio` siguen igual).

## Criterios de aceptación

- Ninguna página admin escribe filtros, empty states ni badges a mano: todo sale de `src/shared/ui/panel/`.
- Las acciones sobre el banner son legibles (contraste AA) en todas las secciones.
- El índice `/panel/solicitudes` presenta fichas responsive centradas en el sector; abrir una
  ficha permite marcarla atendida o cerrarla sin navegar al detalle.
- La entrada y carga progresiva solo animan `transform` y `opacity`, respetan
  `prefers-reduced-motion` y mantienen controles de al menos 44 px.
- No queda `bg-amber-*` ni la constante `campo` duplicada en las pantallas del alcance.
- No queda «punto de acopio» visible en las pantallas del alcance.
- `npm run lint` y `npm run build` pasan.
