# 026 · Guía de diseño y layout consistente del espacio logeado

> Estado: **Planificada** · Depende de: `021 · Espacio del usuario con sidebar` (shell compartido), `011 · Puntos de acopio` y `016 · Perfil de administrador` (patrón visual de referencia) · Roadmap: `constitution/roadmap.md`
>
> _Feature de **experiencia y consistencia visual**: no introduce entidades, dominio ni permisos nuevos. Extrae el patrón visual que ya usan "Puntos de acopio" y "Mi perfil" a una **guía de diseño** (nuevo archivo de constitución) y a **componentes de layout compartidos**, y normaliza todas las vistas del espacio logeado a ese patrón._

## Qué hace

Hoy cada sección del espacio logeado "parece seguir reglas distintas": distintos anchos de contenedor (`max-w-4xl` / `5xl` / `6xl`), distinto padding (`p-6 md:p-8` vs `p-5 md:p-8 lg:p-10`), distinto `gap` vertical (`6` / `7` / `8` / `10`), tamaño de `h1` inconsistente (`text-2xl` vs `text-2xl md:text-3xl`) y dos tratamientos de encabezado que conviven sin criterio: un **encabezado banner** rico (`bg-primary-ink` con icono, eyebrow, título y descripción) en "Puntos de acopio" y "Mi perfil", frente a encabezados planos en el resto.

Esta feature toma como referencia el estilo de **Puntos de acopio** (el que le gusta al cliente) y lo convierte en el estándar:

1. **Crea una guía de diseño en la constitución** (`constitution/ui-guidelines.md`): fuente única que fija contenedor, padding, ritmo vertical (`gap`), escala tipográfica de página, y los dos tipos de encabezado (banner para índices, ligero para subpáginas). Se referencia desde `tech-stack.md § Estilo visual`.
2. **Crea componentes de layout compartidos** que materializan la guía y no se pueden divergir a mano: `<PanelPage>` (contenedor), `<PanelPageHeader>` (encabezado banner) y `<PanelPageSubHeader>` (encabezado ligero para detalle/formularios).
3. **Normaliza todas las vistas del espacio logeado** (`(admin)/panel/*`, `/superadmin/*` y `(app)/*`) a esos componentes: las páginas **índice** de cada sección usan el encabezado banner; las **subpáginas** (detalle, "nuevo", "editar") usan el encabezado ligero. Mismo padding, mismo ancho, misma tipografía en todas.
4. **Normaliza los listados de datos al estilo de "Puntos de acopio"**: hoy la mayoría de listados son `<table>` clásicas (Recursos, Actividades, Solicitudes, Aportes, Donaciones, Propuestas…), mientras Puntos de acopio muestra una **lista de "row-cards"** (contenedor `divide-y rounded-lg border bg-card`, una fila por registro con chip de icono, título, badge de estado, metadatos con iconos pequeños y acciones a la derecha, que colapsa a una columna en móvil). Esta feature extrae ese patrón a componentes compartidos (`<PanelList>`, `<PanelListRow>`, `<PanelListToolbar>`, `<PanelEmptyState>`) y convierte los listados del espacio logeado a esa presentación.
5. **Elimina el `<main>` anidado**: `AppShell` (021) ya renderiza `<main>`, y cada página añade otro `<main>` propio. `<PanelPage>` es un contenedor semántico no-`<main>`, así que el árbol queda con un solo `<main>` por documento.

## Por qué

- **Coherencia percibida.** El espacio logeado se lee como un producto, no como pantallas hechas por manos distintas. La consistencia de padding, ancho y tipografía es lo que más comunica "cuidado" sin costar rediseño.
- **Una fuente de verdad, no 29 copias.** Hoy el layout de página está copiado a mano en cada `page.tsx` (`mx-auto flex w-full max-w-… p-… gap-…`), y por eso divergió. Centralizarlo en componentes hace que "cambiar el padding de todo el panel" sea una edición, no 29.
- **La constitución dejó de ser fiel.** `tech-stack.md § Estilo visual` describe tokens de color y tipografía, pero no fija el layout de página; la guía nueva cierra ese hueco para que futuras features nazcan consistentes.
- **Corrige un defecto de accesibilidad/semántica** (dos `<main>` por documento) heredado de 021.

## Decisiones tomadas

- **Guía de diseño = nuevo archivo de constitución** (`constitution/ui-guidelines.md`), referenciado desde `tech-stack.md`. Es una regla estable, separada del stack técnico. _(Decisión del cliente.)_
- **La consistencia se fuerza con componentes compartidos**, no solo con documentación. Las páginas consumen `<PanelPage>` / `<PanelPageHeader>` / `<PanelPageSubHeader>`; las clases de layout dejan de escribirse a mano en cada `page.tsx`. _(Decisión del cliente.)_
- **El estándar visual es el de "Puntos de acopio" / "Mi perfil"**: contenedor `p-5 md:p-8 lg:p-10` + `gap-7`, `h1` `text-2xl md:text-3xl`, y encabezado banner `bg-primary-ink`. _(Decisión del cliente: "me gusta los estilos de punto de acopio".)_
- **Familias de fuente explícitas en la guía y en los componentes** (no solo tamaño/peso). Se usan las tres familias ya definidas en `tech-stack.md` con el reparto que el panel ya sigue de facto: **títulos y descripción de página en `font-sans` (Geist Sans)**; **números, contadores y fechas en `font-mono` (Geist Mono) + `numeric-tnum`**; **serif (EB Garamond) reservado al wordmark/landing, no a los títulos del panel**. Los componentes (`<PanelPageHeader>`, `<PanelPageSubHeader>`) fijan la familia para que no pueda divergir a mano. _(Se mantiene el `font-sans` en títulos por coherencia con la referencia que gusta al cliente; usar serif en los títulos del panel sería un cambio de dirección aparte.)_
- **Índices con banner, subpáginas con encabezado ligero.** Las páginas índice de sección (Actividades, Recursos, Solicitudes, Donaciones, Red, Perfil, Puntos de acopio) llevan el banner; las de detalle/formulario (`[id]`, `nuevo`, `editar`, `aportar`, `proponer-recurso`) llevan un encabezado ligero (título + "volver"), sin banner, para no recargar y para dar foco al formulario. _(Decisión del cliente.)_
- **Los listados se presentan como row-cards, no como `<table>`.** Se toma como estándar la lista de Puntos de acopio (contenedor con `divide-y`, fila con icono/título/badge/metadatos/acciones, colapso a una columna en móvil), junto con su barra-resumen superior (conteo + acción primaria) y su empty-state (icono + copy + CTA). Todos los listados del espacio logeado adoptan esa presentación mediante componentes compartidos. _(Decisión del cliente: "que los listados de datos se muestren como en Puntos de acopio".)_ Se conserva el **contenido** de cada listado (columnas/datos); solo cambia **cómo se presenta**.
- **El dashboard `/panel` también se alinea**: su encabezado (hoy `DispatchStrip`) se envuelve en el mismo contenedor y se reconcilia visualmente con el banner (ver "Notas y riesgos"; se decide en `plan.md` si el `DispatchStrip` se sustituye por el banner o se conserva como variante).
- **Alcance: todo el espacio logeado** (`(admin)`, `/superadmin` y `(app)`), porque comparten el shell de 021 y todos divergen. Las páginas **públicas** (landing, `/transparencia`, auth/onboarding) quedan **fuera**: tienen su propio lenguaje (hero, `auth-shell`) y no deben adoptar el chrome de panel. _(Decisión del cliente.)_
- **Sin rediseño de contenido.** No se tocan tablas, formularios, mapas ni la lógica de cada página: solo el **marco** (contenedor + encabezado). El "cuerpo" de cada `page.tsx` se conserva.
- **Sin dependencias npm nuevas.** Solo Tailwind, `lucide-react` y el `cn` ya presentes.

## Alcance

**Incluye**

- **`constitution/ui-guidelines.md`**: guía de diseño de layout de página (tokens de contenedor, padding, `gap`, escala tipográfica, anatomía de los dos encabezados, cuándo usar cada uno, y regla de "un solo `<main>`"). Enlace desde `tech-stack.md § Estilo visual`.
- **Componentes compartidos** en `src/shared/ui/` (junto al `app-shell` de 021):
  - `<PanelPage size?>` — contenedor de página (no `<main>`); `size` ∈ `default` (`max-w-5xl`) | `wide` (`max-w-6xl`, para tablas anchas/mapas) | `narrow` (`max-w-3xl`, formularios). Fija `p-5 md:p-8 lg:p-10` + `gap-7`.
  - `<PanelPageHeader icon eyebrow title description actions?>` — encabezado banner (`bg-primary-ink`) para índices.
  - `<PanelPageSubHeader title backHref? backLabel? description? actions?>` — encabezado ligero para detalle/formularios.
  - `<PanelList>` — contenedor de listado (`divide-y overflow-hidden rounded-lg border bg-card`).
  - `<PanelListRow icon title badge? secondary? meta? actions?>` — fila del listado (row-card), con `meta` como lista de `{ icono, texto }` para la línea de metadatos; colapsa a columna en `< md`.
  - `<PanelListToolbar>` — barra superior del listado (conteo/resumen + acción primaria), como la de Puntos de acopio.
  - `<PanelEmptyState icon title description action?>` — estado vacío con icono, copy y CTA.
  - _(Opcional, si aporta)_ `<PanelSectionTabs>` para la sub-navegación Perfil/Puntos de acopio (hoy `profile-section-link` duplicado en dos páginas).
- **Conversión de los listados a row-cards** (conservando datos y acciones): `RecursosTabla`, `ActividadesTabla`, `SolicitudesTabla`, `AportesTabla`, `AportantesTabla`, `PropuestasTabla`, `MediosDonacionTabla`, `IngresosMonetariosTabla`, `RedTabla`, y las tablas inline de `mis-aportes` y `solicitudes/[id]` (admin y app). `ProgresoMetas` se revisa pero puede conservar su formato de progreso si no es un listado tabular.
- **Refactor de todas las páginas del espacio logeado** para consumir esos componentes, conservando su cuerpo:
  - `(admin)/panel/*`: dashboard, actividades (índice + nueva/[id]/[id]/editar), recursos (índice + nuevo/[id]/editar/propuestas), solicitudes (índice + [id]), donaciones (índice + nuevo/[id]/editar/ingresos/nuevo), perfil, puntos-acopio, red.
  - `/superadmin/admins`.
  - `(app)/*`: actividades (índice + [id]/[id]/aportar), mis-aportes, puntos-acopio (índice + [id]), mi-perfil, solicitudes (índice + nueva/proponer-recurso/[id]/[id]/editar).
- **Eliminación del `<main>` anidado** en cada página (el `<main>` único queda en `AppShell`).
- Tests (Vitest) de las piezas con lógica (p. ej. el mapeo `size → max-w` de `<PanelPage>` si se resuelve por función pura).

**No incluye**

- **Rediseño de contenido** de ninguna vista: tablas, formularios, cards, mapas y su copy se conservan tal cual.
- **Cambios de dominio, datos, permisos o rutas.** Las URLs y la autorización no cambian.
- **Páginas públicas / onboarding** (landing, `/transparencia`, `(auth)/*`, `/completar-perfil`, `/cuenta-admin`): fuera de alcance, incluidas sus tablas/listas públicas (`transparencia`).
- **Cambios en los datos o columnas de cada listado.** No se agregan ni quitan campos: el mismo dato que hoy está en una celda pasa a estar en el título, badge o metadatos de la row-card, sin perder información ni acciones.
- **Dark mode, temas o densidad configurable.** La guía documenta el modo claro actual.
- **Nuevos tokens de color o nuevas familias de fuente.** No se añaden fuentes ni colores: se usan los ya definidos en `tech-stack.md`. Lo que esta feature sí hace es **fijar qué familia existente usa cada elemento de página** (títulos = sans, números = mono, etc.) como parte de la consistencia; no reabre la elección de tipografías.

## Criterios de aceptación

- [ ] Existe `constitution/ui-guidelines.md` con: tokens de contenedor (ancho por `size`, padding, `gap`), escala tipográfica de página (**tamaño, peso y familia** por elemento), anatomía de los dos encabezados y la regla de cuándo usar cada uno, y la regla de "un solo `<main>` por documento". `tech-stack.md § Estilo visual` lo referencia.
- [ ] La guía y los componentes fijan la **familia de fuente por elemento**: títulos/descripción de página en `font-sans`, números/contadores/fechas en `font-mono` + `numeric-tnum`; serif no se usa en títulos del panel. Ninguna página del espacio logeado usa una familia distinta para el mismo tipo de elemento.
- [ ] Existen `<PanelPage>`, `<PanelPageHeader>` y `<PanelPageSubHeader>` en `src/shared/ui/`, exportados desde su barril, con las clases derivadas de la guía.
- [ ] **Toda** página índice del espacio logeado (Actividades, Recursos, Solicitudes, Donaciones, Red, Perfil, Puntos de acopio, Aprobaciones del superadmin, y las índices de `(app)`) usa `<PanelPageHeader>` (banner) dentro de `<PanelPage>`.
- [ ] **Toda** subpágina (detalle `[id]`, `nuevo`, `editar`, `aportar`, `proponer-recurso`) usa `<PanelPageSubHeader>` (ligero) dentro de `<PanelPage>`.
- [ ] Todas las páginas del espacio logeado comparten **el mismo** contenedor: mismo padding (`p-5 md:p-8 lg:p-10`), mismo ritmo (`gap-7`) y ancho coherente por tipo de página; ningún `page.tsx` del espacio logeado repite a mano `mx-auto flex w-full max-w-… p-… gap-…`.
- [ ] Los listados del espacio logeado se muestran como **row-cards** al estilo de Puntos de acopio (contenedor `divide-y`, filas con icono/título/badge/metadatos/acciones, colapso a columna en móvil), con su barra-resumen y su empty-state; ningún listado del espacio logeado usa ya `<table>` (salvo `ProgresoMetas` si se justifica como no-listado). Se conservan todos los datos y acciones de cada listado.
- [ ] Cada documento del espacio logeado tiene **un solo** elemento `<main>` (el de `AppShell`); ninguna página anida otro `<main>`.
- [ ] El aspecto de "Puntos de acopio" y "Mi perfil" **no empeora** (siguen siendo la referencia; a lo sumo se mueven detrás de los componentes sin cambio visible).
- [ ] `pnpm test` en verde (incluidas las piezas nuevas). `pnpm exec eslint src` sin errores (nombres kebab-case en `src/shared/ui`). `pnpm build` sin errores.
- [ ] Validación a ojo por rol (`ADMIN`, `SUPERADMIN`, `COLABORADOR`, `SOLICITANTE`): navegar cada sección y confirmar padding/ancho/encabezado uniformes en desktop y móvil.

## Notas y riesgos

- **Refactor amplio y mecánico (~29 páginas + ~12 listados).** El riesgo es de regresión visual, no de lógica. Mitigación: migrar primero los componentes + una página piloto (p. ej. Recursos índice, su tabla y Recurso "nuevo"), revisar a ojo, y luego propagar. Conservar el cuerpo de cada página literalmente; solo cambia el envoltorio y la presentación del listado.
- **Row-cards vs. datos densos/comparables.** El formato row-card brilla en entidades con pocos campos y un par de acciones (Puntos de acopio). En listados muy tabulares o comparativos (p. ej. ingresos monetarios con montos que se comparan de un vistazo), la card puede reducir la "escaneabilidad" de columnas. Mitigación: en desktop, `<PanelListRow>` puede alinear sus metadatos en una fila ordenada (semitabular) y reservar el stack a móvil; si algún listado pierde legibilidad como card, documentarlo y evaluar una variante. Por defecto, se sigue la decisión del cliente (row-cards en todos).
- **Semántica/accesibilidad.** Al pasar de `<table>` a lista de `<article>`, mantener encabezados/labels legibles (los que eran `<th>` pasan a labels de metadato o `aria-label`), y conservar el orden lógico para lectores de pantalla.
- **`<main>` anidado.** Al reemplazar el `<main>` de cada página por `<PanelPage>` (un `<div>`/`<section>`), verificar que no se pierdan estilos que colgaban del `<main>` (p. ej. `flex-1`). `<PanelPage>` debe replicar `flex flex-1 flex-col`.
- **Dashboard `/panel` y `DispatchStrip`.** El dashboard no tiene hoy encabezado banner sino `DispatchStrip`. Decidir en `plan.md`: (a) envolver el dashboard en `<PanelPage>` y sustituir `DispatchStrip` por `<PanelPageHeader>`, o (b) conservar `DispatchStrip` como variante de encabezado dentro del contenedor estándar. Recomendado (a) para coherencia total, validando que no se pierda el resumen operativo ("N por preparar, …").
- **Ancho por página.** Puntos de acopio y Red usan tablas/mapas anchos (`max-w-6xl`); formularios simples se leen mejor estrechos (`max-w-3xl`). El `size` de `<PanelPage>` cubre esto; clasificar cada página en `plan.md` para no forzar un ancho único que perjudique tablas o formularios.
- **Sub-nav Perfil/Puntos de acopio.** Ese `profile-section-link` está duplicado en dos páginas; si se extrae a `<PanelSectionTabs>`, mantener el mismo marcado para no alterar su aspecto.
- **Next 16.** Antes de tocar componentes de servidor/cliente y `layout`, revisar la guía en `node_modules/next/dist/docs/` (AGENTS.md). `<PanelPageHeader>` puede ser server component puro; `<PanelPageSubHeader>` con "volver" también (usa `<Link>`).
