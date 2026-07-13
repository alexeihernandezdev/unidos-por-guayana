# Guía de diseño y layout del espacio logeado

> Fuente única del **marco de página** (contenedor, encabezados, listados y tipografía de
> página) del espacio logeado. La referencia visual es **Puntos de acopio / Mi perfil**.
> Complementa `tech-stack.md § Estilo visual` (tokens de color, familias de fuente, motion),
> que la referencia. Introducida por la feature `026`.
>
> **Regla de oro:** el layout de página **no se escribe a mano** en los `page.tsx`. Se consume
> de los componentes de `src/shared/ui/panel/` (`<PanelPage>`, `<PanelPageHeader>`,
> `<PanelPageSubHeader>`, `<PanelList>`, `<PanelListRow>`, `<PanelListToolbar>`,
> `<PanelEmptyState>`). Si un componente no cubre un caso, se amplía el componente, no se
> vuelve a copiar el marcado en una página.

## Alcance

- **Aplica a** todo el espacio logeado que comparte el shell de `021`: `(admin)/panel/*`,
  `/superadmin/*` y `(app)/*`.
- **No aplica a** páginas públicas / onboarding (landing, `/transparencia`, `(auth)/*`,
  `/completar-perfil`, `/cuenta-admin`): tienen su propio lenguaje (hero, `auth-shell`) y no
  adoptan el chrome de panel.

## 1. Contenedor de página — `<PanelPage>`

Toda página del espacio logeado envuelve su cuerpo en `<PanelPage>`, que rinde:

```
flex w-full flex-1 flex-col gap-7 p-5 md:p-8 lg:p-10
```

- **Ancho completo, sin centrado:** la página ocupa todo el ancho del área de contenido (sin
  `max-w-*` ni `mx-auto`); se alinea a la izquierda y se estira a lo ancho. No hay variantes de
  ancho: todas las pantallas comparten el mismo contenedor.
- **Ritmo vertical:** `gap-7` entre bloques de página (encabezado, filtros, listado…). Los
  formularios internos usan su propio `gap-6`.
- **No es `<main>`:** `AppShell` (`021`) ya provee el único `<main>` del documento.
  `<PanelPage>` es un `<div>`, y replica `flex flex-1 flex-col` para no perder el estiramiento
  vertical que colgaba del `<main>`.

## 2. Escala tipográfica de página

Familia por elemento (usa las tres familias de `tech-stack.md`; alias `font-sans` / `font-mono`
/ `font-serif`):

| Elemento                          | Familia     | Clases                                                              |
| --------------------------------- | ----------- | ------------------------------------------------------------------ |
| `h1` en índice (con banner)       | `font-sans` | `text-2xl font-semibold tracking-tight md:text-3xl`                |
| `h1` en subpágina (ligero)        | `font-sans` | `text-2xl font-semibold tracking-tight`                            |
| Descripción bajo el título        | `font-sans` | `text-sm leading-6` (banner: `text-white/75`; ligero: `text-muted-foreground`) |
| Eyebrow (solo banner)             | `font-sans` | `mb-1 text-sm text-white/70`                                       |
| `h2` de sección dentro del cuerpo | `font-sans` | `text-sm font-semibold` (o `profile-section-heading` existente)    |
| Números, contadores, fechas       | `font-mono` | `font-mono … numeric-tnum`                                          |

Reglas de familia:

- **`font-sans` (Geist Sans)** es la fuente por defecto de títulos, cuerpo y UI del panel. Los
  componentes de encabezado **no** aplican `font-serif`.
- **`font-mono` (Geist Mono) + `numeric-tnum`** para todo dato numérico tabular (cantidades,
  montos, porcentajes, fechas, contadores), como ya hacen `TarjetaMetrica` y `DispatchStrip`.
- **`font-serif` (EB Garamond)** queda **reservado** al wordmark y a la landing editorial; **no**
  se usa en los títulos del panel. Cambiar los títulos del panel a serif sería una decisión de
  dirección aparte, fuera de esta guía.

## 3. Encabezado banner (índices) — `<PanelPageHeader>`

Se usa en la **página índice** de cada sección. Anatomía (derivada de Puntos de acopio / Mi
perfil):

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

## 4. Encabezado ligero (subpáginas) — `<PanelPageSubHeader>`

Se usa en **detalle (`[id]`), `nuevo`, `editar`, `aportar`, `proponer-recurso`**: título + un
"volver", sin banner, para dar foco al formulario.

```
header.flex.flex-col.gap-2
  Link.inline-flex.items-center.gap-1.5.text-sm.text-muted-foreground.hover:text-foreground > <ArrowLeft className="size-4" /> {backLabel}
  div.flex.items-end.justify-between.gap-4
    div
      h1.text-2xl.font-semibold.tracking-tight → title
      p.text-sm.text-muted-foreground          → description (opcional)
    (opcional) div.actions
```

## 5. Listados de datos (row-cards) — `<PanelList>` / `<PanelListRow>`

Los listados se presentan como **lista de row-cards**, no como `<table>`. Anatomía (derivada de
`PuntosAcopioGestion`):

```
(barra-resumen)  <PanelListToolbar resumen="N puntos en total">  … acción primaria …
  → div.flex.flex-wrap.items-center.justify-between.gap-4.rounded-lg.border.bg-card.p-4

(listado)        <PanelList>  <PanelListRow … /> × N  </PanelList>
  → div.divide-y.overflow-hidden.rounded-lg.border.bg-card
      article.flex.flex-col.gap-4.p-4.hover:bg-muted/30.md:flex-row.md:items-center.md:justify-between
        div.flex.min-w-0.items-start.gap-3
          span.profile-icon.size-10 > <Icon />        → chip de icono
          div.min-w-0
            div.flex.flex-wrap.items-center.gap-2 → h2 (título) + badge (pill de estado)
            p.mt-0.5.text-sm.text-muted-foreground → secundaria
            div.mt-2.flex.flex-wrap.gap-x-4.gap-y-1.text-xs.text-muted-foreground → metadatos
              span.inline-flex.items-center.gap-1 > <Icon.size-3.5 /> {texto}   (×N)
        div.flex.shrink-0.gap-2.md:justify-end → acciones

(vacío)          <PanelEmptyState icon title description action? />
  → div.flex.flex-col.items-center.gap-3.border-t.border-border.py-16.text-center
```

- **Se conserva el contenido de cada listado**: los datos y acciones que estaban en columnas
  pasan a título, badge, secundaria, metadatos o acciones de la row-card. No se agregan ni
  quitan campos.
- **Números dentro de la card** (cantidades, montos, fechas) en `font-mono` + `numeric-tnum`.
- **Badges de estado**: pill `rounded-full px-2 py-0.5 text-xs`; activo con
  `bg-primary/10 text-primary-ink`, neutro con `bg-muted text-muted-foreground`.
- **Desktop semitabular:** la fila alinea sus metadatos en `md:flex-row`; el stack a una columna
  se reserva a `< md`, para no perder escaneabilidad en listados densos.
- **Accesibilidad:** los antiguos `<th>` pasan a labels de metadato o `aria-label`; se conserva
  el orden lógico para lectores de pantalla.

## 6. Reglas

- **Un solo `<main>` por documento** (lo provee `AppShell`). Ninguna página anida otro `<main>`;
  usa `<PanelPage>` (un `<div>`).
- **Índice de sección → banner** (`<PanelPageHeader>`); **detalle/formulario → ligero**
  (`<PanelPageSubHeader>`).
- **Listados → row-cards** (`<PanelList>` / `<PanelListRow>`), no `<table>`. Excepción posible:
  `ProgresoMetas`, que es un display de progreso, no un listado tabular.
- **No reescribir a mano** `mx-auto flex w-full max-w-… p-… gap-…` en un `page.tsx`: usar
  `<PanelPage>`.
- Respetar los límites duros de `tech-stack.md § Estilo visual` (sin `transition: all` en código
  propio, `ease-out`/`--ease-out-emil`, radios del token, `strokeWidth={1.5}` en iconos, sin
  em-dash en texto visible).
